// clashdb wrapper - talks to ur upstash redis proxy over http
// all the playlist/settings/ban stuff lives here

const fetch = require("node-fetch");
const { config } = require("./config");

const BASE = config.dbUrl;
const KEY = config.dbKey;
const active = !!(BASE && KEY);

if (!active) console.log("  ! clashdb disabled");

async function req(method, path, body) {
  if (!active) return null;
  try {
    const opts = {
      method,
      headers: { "Content-Type": "application/json", "x-api-key": KEY },
    };
    if (body && (method === "POST" || method === "PUT")) {
      opts.body = JSON.stringify(body);
    }
    const r = await fetch(`${BASE}${path}`, opts);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    console.error("db error:", e.message);
    return null;
  }
}

// basic crud
const get = (key) => req("GET", `/api/data/${key}`);
const set = (key, val) => req("POST", `/api/data/${key}`, val);
const del = (key) => req("DELETE", `/api/data/${key}`);

// playlists
async function savePlaylist(uid, name, songs) {
  await set(`pl:${uid}:${name}`, { name, songs, ts: Date.now() });
  // also update the user's playlist index
  const idx = (await get(`pls:${uid}`)) || { list: [] };
  if (!idx.list.includes(name)) idx.list.push(name);
  await set(`pls:${uid}`, idx);
}

const getPlaylist = (uid, name) => get(`pl:${uid}:${name}`);
const getUserPlaylists = (uid) => get(`pls:${uid}`);

async function deletePlaylist(uid, name) {
  await del(`pl:${uid}:${name}`);
  const idx = (await get(`pls:${uid}`)) || { list: [] };
  idx.list = idx.list.filter(n => n !== name);
  await set(`pls:${uid}`, idx);
}

// group settings
async function getSettings(chatId) {
  return (await get(`cfg:${chatId}`)) || {
    adminOnly: false,
    maxQueue: config.maxQueue,
    defVolume: config.defVolume,
  };
}
const setSettings = (chatId, s) => set(`cfg:${chatId}`, s);

// bans
const ban = (uid) => set(`ban:${uid}`, { banned: true, ts: Date.now() });
const unban = (uid) => del(`ban:${uid}`);
const isBanned = async (uid) => {
  const d = await get(`ban:${uid}`);
  return d?.banned === true;
};

// stats
async function getStats() {
  return (await get("stats")) || { played: 0, started: Date.now() };
}
async function incPlayed() {
  const s = await getStats();
  s.played = (s.played || 0) + 1;
  await set("stats", s);
}

// track active chats for broadcast
const trackChat = (id, title) => set(`chat:${id}`, { id, title, ts: Date.now() });

module.exports = {
  get, set, del,
  savePlaylist, getPlaylist, getUserPlaylists, deletePlaylist,
  getSettings, setSettings,
  ban, unban, isBanned,
  getStats, incPlayed,
  trackChat,
};
