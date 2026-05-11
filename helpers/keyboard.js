// inline keyboard builders

const { InlineKeyboard } = require("grammy");

function controls(paused) {
  return new InlineKeyboard()
    .text(paused ? "🔴 ▶️ 🔴" : "🔴 ⏸ 🔴", paused ? "ctrl:resume" : "ctrl:pause")
    .text("✨ ⏭ ✨", "ctrl:skip")
    .row()
    .text("🛑 ⏹ 🛑", "ctrl:stop")
    .text("🔥 📋 🔥", "ctrl:queue");
}

function searchBtns(songs) {
  const kb = new InlineKeyboard();
  songs.forEach((s, i) => kb.text(`${i + 1}`, `pick:${s.id}`));
  kb.row().text("✕ cancel", "dismiss");
  return kb;
}

function plList(names) {
  const kb = new InlineKeyboard();
  names.forEach(n => kb.text(`📁 ${n}`, `pl:load:${n}`).row());
  kb.text("✕", "dismiss");
  return kb;
}

function settingsKb(s) {
  return new InlineKeyboard()
    .text(`${s.adminOnly ? "🔒" : "🔓"} admin only: ${s.adminOnly ? "on" : "off"}`, "set:admin")
    .row()
    .text("✕", "dismiss");
}

function startKb() {
  return new InlineKeyboard()
    .text("📖 help", "go:help")
    .url("📢 channel", "https://t.me/clashmusic")
    .row()
    .url("➕ add to group", "https://t.me/?startgroup=true")
    .text("📊 stats", "go:stats");
}

function helpKb() {
  return new InlineKeyboard()
    .text("🎵 music", "help:music")
    .text("📋 queue", "help:queue")
    .row()
    .text("⚙️ settings", "help:settings")
    .text("👑 owner", "help:owner")
    .row()
    .text("✕", "dismiss");
}

const closeBtn = () => new InlineKeyboard().text("✕", "dismiss");

module.exports = { controls, searchBtns, plList, settingsKb, startKb, helpKb, closeBtn };
