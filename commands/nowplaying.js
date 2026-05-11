const queue = require("../helpers/player");
const { nowPlayingText } = require("../helpers/utils");
const { controls } = require("../helpers/keyboard");

module.exports = (bot) => {
  bot.command(["np", "nowplaying", "now"], async (ctx) => {
    const s = queue.current(ctx.chat.id);
    if (!s) return ctx.reply("nothing playing rn");
    const q = queue.info(ctx.chat.id);
    
    const photoUrl = s.image || "https://telegra.ph/file/bcab0474ceae72b8c5ea9.jpg";
    const npMsg = await ctx.replyWithPhoto(photoUrl, {
      caption: nowPlayingText(s, q), 
      parse_mode: "HTML", reply_markup: controls(!q.playing) 
    });

    // Update the message ID so the existing interval updates this new message instead
    if (queue.has(ctx.chat.id)) {
      queue.get(ctx.chat.id).npMessageId = npMsg.message_id;
    }
  });
};
