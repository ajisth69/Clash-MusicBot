const { config } = require("../config");
const { startKb } = require("../helpers/keyboard");
const db = require("../database");

module.exports = (bot) => {
  bot.command("start", async (ctx) => {
    if (ctx.chat.type !== "private") {
      db.trackChat(ctx.chat.id, ctx.chat.title).catch(() => {});
    }

    const msg =
      `🎵 <b>${config.botName}</b>\n\n` +
      `yo ${ctx.from.first_name}! i can play music from jiosaavn right here in telegram.\n\n` +
      `just do <code>/play song name</code> and i'll handle the rest.\n\n` +
      `• search & play from jiosaavn\n` +
      `• queue management\n` +
      `• dynamic playing bar\n\n` +
      `by @${config.ownerUsername}`;

    await ctx.replyWithPhoto(config.picStart, {
      caption: msg,
      parse_mode: "HTML",
      reply_markup: startKb()
    });
  });
};
