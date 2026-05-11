const queue = require("../helpers/player");
const { esc } = require("../helpers/utils");

module.exports = (bot) => {
  bot.command("remove", async (ctx) => {
    const arg = ctx.match?.trim();
    if (!arg) return ctx.reply("/remove [position number]");
    const pos = parseInt(arg);
    if (isNaN(pos) || pos < 1) return ctx.reply("gimme a valid position number");
    const removed = queue.remove(ctx.chat.id, pos);
    if (!removed) return ctx.reply("invalid position, check /queue");
    await ctx.reply(`removed #${pos}: ${esc(removed.name)} 🗑`, { parse_mode: "HTML" });
  });
};
