const { helpKb } = require("../helpers/keyboard");
const { config } = require("../config");

const texts = {
  main:
    `📖 <b>help</b> — pick a category\n\n` +
    `🎵 music — play, pause, skip etc\n` +
    `📋 queue — manage the queue\n` +
    `⚙️ settings — group config\n` +
    `👑 owner — admin stuff`,

  music:
    `🎵 <b>music</b>\n\n` +
    `/play [name/url] — play a song\n` +
    `/pause — pause\n` +
    `/resume — resume\n` +
    `/skip — next song\n` +
    `/stop — stop everything\n` +
    `/np — whats playing rn\n` +
    `/search [query] — pick from results\n` +
    `/lyrics [song] — get lyrics\n` +
    `/seek [secs] — seek (vc only)`,

  queue:
    `📋 <b>queue</b>\n\n` +
    `/queue — show the queue\n` +
    `/remove [pos] — remove a song\n`,

  settings:
    `⚙️ <b>settings</b>\n\n` +
    `/settings — open settings panel\n\n` +
    `you can toggle admin-only mode and stuff`,

  owner:
    `👑 <b>owner</b>\n\n` +
    `/broadcast [msg] — send to all chats\n` +
    `/stats — bot stats\n` +
    `/ban [id] — ban someone\n` +
    `/unban [id] — unban\n` +
    `/eval [code] — run js\n` +
    `/restart — restart bot`,
};

module.exports = (bot) => {
  bot.command("help", (ctx) =>
    ctx.replyWithPhoto(config.picHelp, { caption: texts.main, parse_mode: "HTML", reply_markup: helpKb() })
  );

  bot.callbackQuery(/^help:(.+)$/, async (ctx) => {
    // If the original message is a photo, editMessageCaption is needed.
    // However, grammy handles this with ctx.editMessageCaption
    await ctx.editMessageCaption({
      caption: texts[ctx.match[1]] || texts.main,
      parse_mode: "HTML", reply_markup: helpKb(),
    }).catch(e => {
      // If it's not a caption, fallback to editMessageText
      ctx.editMessageText(texts[ctx.match[1]] || texts.main, {
        parse_mode: "HTML", reply_markup: helpKb(),
      }).catch(()=>{});
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("go:help", async (ctx) => {
    // Start button leads here, start message is also a photo!
    await ctx.editMessageCaption({ 
      caption: texts.main, 
      parse_mode: "HTML", reply_markup: helpKb() 
    }).catch(()=>{});
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("dismiss", async (ctx) => {
    await ctx.deleteMessage().catch(() => {});
    await ctx.answerCallbackQuery();
  });
};
