const queue = require("../helpers/player");
const { queueText } = require("../helpers/utils");
const { closeBtn } = require("../helpers/keyboard");

module.exports = (bot) => {
  bot.command("queue", async (ctx) => {
    const q = queue.info(ctx.chat.id);
    if (!q.songs.length) return ctx.reply("queue is empty, /play something");
    await ctx.reply(queueText(q), { parse_mode: "HTML", reply_markup: closeBtn() });
  });

  bot.callbackQuery("ctrl:queue", async (ctx) => {
    const q = queue.info(ctx.chat.id);
    if (!q.songs.length) return ctx.answerCallbackQuery("queue empty");
    await ctx.api.sendMessage(ctx.chat.id, queueText(q), { parse_mode: "HTML", reply_markup: closeBtn() });
    await ctx.answerCallbackQuery();
  });
};
