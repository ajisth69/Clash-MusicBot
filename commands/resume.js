const queue = require("../helpers/player");

module.exports = (bot) => {
  bot.command("resume", async (ctx) => {
    if (!queue.has(ctx.chat.id)) return ctx.reply("queue is empty, /play something first");
    const q = queue.get(ctx.chat.id);
    if (q.playing) return ctx.reply("already playing lol");
    queue.setPlaying(ctx.chat.id, true);
    const s = queue.current(ctx.chat.id);
    await ctx.reply(`▶️ resumed: ${s?.name || "unknown"}`);
  });
};
