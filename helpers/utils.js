// formatting helpers

function dur(secs) {
  if (!secs) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function bar(curr, total, len = 15) {
  if (!total) return "▬".repeat(len);
  const f = Math.max(0, Math.min(len, Math.round((curr / total) * len)));
  const b = "▬".repeat(f) + "🔘" + "▬".repeat(Math.max(0, len - f - 1));
  return `${dur(curr)} ${b} ${dur(total)}`;
}

function trunc(t, n = 30) {
  return !t ? "" : t.length > n ? t.slice(0, n - 1) + "…" : t;
}

// escape for telegram html
function esc(t) {
  return !t ? "" : t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function nowPlayingText(song, q = {}) {
  // calculate played time based on startedAt if available
  let played = 0;
  if (q.startedAt && q.playing) {
    played = Math.floor((Date.now() - q.startedAt) / 1000);
  }
  if (played > song.duration) played = song.duration;
  
  return [
    `🎵 <b>Now Playing</b>\n`,
    `<b>${esc(song.name)}</b>`,
    `👤 ${esc(song.artists)}`,
    `💿 ${esc(song.album)}`,
    `\n${bar(played, song.duration)}`,
  ].join("\n");
}

function queueText(q) {
  if (!q.songs.length) return "📭 queue is empty";
  let out = `🎶 <b>Queue</b> — ${q.songs.length} songs\n\n`;
  q.songs.forEach((s, i) => {
    const prefix = i === q.pos ? "▶️" : `${i + 1}.`;
    out += `${prefix} <b>${esc(trunc(s.name, 35))}</b> — ${esc(trunc(s.artists, 20))} [${dur(s.duration)}]\n`;
  });
  return out;
}

function searchText(songs) {
  if (!songs.length) return "❌ nothing found";
  let out = `🔍 <b>Results</b>\n\n`;
  songs.forEach((s, i) => {
    out += `${i + 1}. <b>${esc(trunc(s.name, 35))}</b>\n`;
    out += `   ${esc(trunc(s.artists, 25))} • ${dur(s.duration)}\n\n`;
  });
  return out;
}

function uptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return [d && `${d}d`, h && `${h}h`, `${m}m`].filter(Boolean).join(" ");
}

module.exports = { dur, bar, trunc, esc, nowPlayingText, queueText, searchText, uptime };
