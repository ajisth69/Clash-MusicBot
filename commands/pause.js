const queue = require("../helpers/player");

module.exports = (bot) => {
  bot.command("pause", async (ctx) => {
    if (!queue.has(ctx.chat.id)) return ctx.reply("nothing playing rn");
    const q = queue.get(ctx.chat.id);
    if (!q.playing) return ctx.reply("already paused, /resume to continue");
    queue.setPlaying(ctx.chat.id, false);
    await ctx.reply("⏸ paused");
  });
};
