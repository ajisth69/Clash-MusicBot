// in-memory queue manager
// each chat gets its own queue state

const { config } = require("../config");
const { TGCallsJs } = require("tgcallsjs");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const queues = new Map();
let userbot = null;

// temp dir for downloaded audio
const TEMP_DIR = path.join(__dirname, "..", "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

function setClient(client) {
  userbot = client;
}
function getClient() {
  return userbot;
}

function get(chatId) {
  if (!queues.has(chatId)) {
    queues.set(chatId, {
      songs: [],
      pos: 0,
      playing: false,
      startedAt: null,
      updateInterval: null,
      npMessageId: null,
      tg: userbot ? new TGCallsJs(userbot, chatId) : null,
      vcChecker: null,
      audioProcess: null,
    });
  }
  const q = queues.get(chatId);
  if (q.tg && !q.vcChecker) {
    q.vcChecker = setInterval(() => {
      if (q.playing && q.tg && q.tg.audioFinished) {
        const next = skip(chatId);
        if (!next) clear(chatId);
      }
    }, 3000);
  }
  return q;
}

function has(chatId) {
  const q = queues.get(chatId);
  return q && q.songs.length > 0;
}

function add(chatId, song) {
  const q = get(chatId);
  if (q.songs.length >= config.maxQueue) return -1;
  q.songs.push(song);
  return q.songs.length;
}

function addMany(chatId, songs) {
  const q = get(chatId);
  const space = config.maxQueue - q.songs.length;
  const batch = songs.slice(0, space);
  q.songs.push(...batch);
  return batch.length;
}

function current(chatId) {
  const q = queues.get(chatId);
  return q?.songs[q.pos] || null;
}

function skip(chatId) {
  const q = queues.get(chatId);
  if (!q || !q.songs.length) return null;
  q.pos++;
  return q.pos >= q.songs.length ? null : q.songs[q.pos];
}

function remove(chatId, position) {
  const q = queues.get(chatId);
  if (!q || position < 1 || position > q.songs.length) return null;
  const idx = position - 1;
  const [removed] = q.songs.splice(idx, 1);
  if (idx < q.pos) q.pos--;
  if (q.pos >= q.songs.length) q.pos = Math.max(0, q.songs.length - 1);
  return removed;
}

function shuffle(chatId) {
  const q = queues.get(chatId);
  if (!q || q.songs.length <= 1) return false;
  const rest = q.songs.splice(q.pos + 1);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  q.songs.push(...rest);
  return true;
}

// Download audio file completely to disk before playing
async function downloadAudio(url, chatId) {
  const mp3Path = path.join(TEMP_DIR, `dl_${chatId}.mp3`);
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  
  await new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(mp3Path);
    res.body.pipe(dest);
    dest.on("finish", resolve);
    dest.on("error", reject);
  });
  
  return mp3Path;
}

function setPlaying(chatId, s) { 
  const q = get(chatId);
  q.playing = s; 
  if (s) {
    if (!q.startedAt) q.startedAt = Date.now();
    if (q.tg && q.songs[q.pos]) {
      // Kill existing process if any
      if (q.audioProcess) {
        q.audioProcess.kill("SIGKILL");
        q.audioProcess = null;
      }

      downloadAudio(q.songs[q.pos].url, chatId)
        .then(mp3Path => {
          // -re limits ffmpeg to 1x playback speed.
          // -ac 1 (Mono) reduces CPU load by 50% vs Stereo, still sounds perfect for Voice Chat
          const proc = spawn('ffmpeg', [
              '-re', 
              '-i', mp3Path,
              '-f', 's16le',
              '-ac', '1',
              '-ar', '48000',
              'pipe:1'
          ]);
          
          q.audioProcess = proc;
          
          // Handle process exit
          proc.on("exit", () => { if (q.audioProcess === proc) q.audioProcess = null; });

          return q.tg.stream(
            { readable: proc.stdio[1] }, 
            undefined, 
            { media: { audio: { sampleRate: 48000, channelCount: 1 } } }
          );
        })
        .catch(e => console.log("VC Error:", e.message));
    }
  } else {
    if (q.tg && q.tg.pauseAudio) q.tg.pauseAudio();
  }
}

function clear(chatId) { 
  const q = queues.get(chatId);
  if (q && q.updateInterval) clearInterval(q.updateInterval);
  if (q && q.vcChecker) clearInterval(q.vcChecker);
  if (q && q.tg) {
    q.tg.stop().catch(()=>{});
  }
  if (q && q.audioProcess) {
    q.audioProcess.kill("SIGKILL");
    q.audioProcess = null;
  }
  // cleanup temp files
  fs.unlink(path.join(TEMP_DIR, `dl_${chatId}.mp3`), () => {});
  queues.delete(chatId); 
}

function info(chatId) {
  const q = queues.get(chatId);
  if (!q) return { songs: [], pos: 0, playing: false };
  return { ...q, total: q.songs.length };
}

function activeChats() { return [...queues.keys()]; }

module.exports = { setClient, getClient, get, has, add, addMany, current, skip, remove, shuffle, setPlaying, clear, info, activeChats };
