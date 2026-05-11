const queue = require("../helpers/player");

module.exports = (bot) => {
  bot.command("stop", async (ctx) => {
    if (!queue.has(ctx.chat.id)) return ctx.reply("nothing playing");
    queue.clear(ctx.chat.id);
    await ctx.reply("⏹ stopped, queue cleared");
  });

  bot.callbackQuery("ctrl:stop", async (ctx) => {
    queue.clear(ctx.chat.id);
    await ctx.deleteMessage().catch(()=>{});
    await ctx.api.sendMessage(ctx.chat.id, "🛑 stopped");
    await ctx.answerCallbackQuery();
  });
};
