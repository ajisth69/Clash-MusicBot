const queue = require("../helpers/player");
const db = require("../database");
const { nowPlayingText } = require("../helpers/utils");
const { controls } = require("../helpers/keyboard");

module.exports = (bot) => {
  bot.command("skip", async (ctx) => {
    if (!queue.has(ctx.chat.id)) return ctx.reply("nothing to skip");

    const next = queue.skip(ctx.chat.id);
    if (!next) {
      queue.clear(ctx.chat.id);
      return ctx.reply("⏹ queue ended");
    }

    queue.setPlaying(ctx.chat.id, true);
    db.incPlayed().catch(() => {});

    const photoUrl = next.image || "https://telegra.ph/file/bcab0474ceae72b8c5ea9.jpg";
    const npMsg = await ctx.replyWithPhoto(photoUrl, {
      caption: nowPlayingText(next, queue.info(ctx.chat.id)),
      parse_mode: "HTML", reply_markup: controls(false),
    });

    if (queue.get(ctx.chat.id).updateInterval) clearInterval(queue.get(ctx.chat.id).updateInterval);
    queue.get(ctx.chat.id).npMessageId = npMsg.message_id;
    
    const interval = setInterval(async () => {
      const qState = queue.get(ctx.chat.id);
      if (!qState || !qState.playing || !qState.npMessageId) return clearInterval(interval);
      try {
        const currentSong = qState.songs[qState.pos] || next;
        await ctx.api.editMessageCaption(ctx.chat.id, qState.npMessageId, {
          caption: nowPlayingText(currentSong, qState),
          parse_mode: "HTML", reply_markup: controls(false)
        });
      } catch (e) {
        if (e.message.includes("not found")) clearInterval(interval);
      }
    }, 30000);
    queue.get(ctx.chat.id).updateInterval = interval;
  });

  // inline button
  bot.callbackQuery("ctrl:skip", async (ctx) => {
    const next = queue.skip(ctx.chat.id);
    if (!next) {
      queue.clear(ctx.chat.id);
      await ctx.editMessageText("⏹ queue ended");
      return ctx.answerCallbackQuery();
    }

    queue.setPlaying(ctx.chat.id, true);
    db.incPlayed().catch(() => {});

    // delete old message and send new one
    await ctx.deleteMessage().catch(()=>{});
    const photoUrl = next.image || "https://telegra.ph/file/bcab0474ceae72b8c5ea9.jpg";
    const npMsg = await ctx.api.sendPhoto(ctx.chat.id, photoUrl, {
      caption: nowPlayingText(next, queue.info(ctx.chat.id)),
      parse_mode: "HTML", reply_markup: controls(false),
    });

    if (queue.get(ctx.chat.id).updateInterval) clearInterval(queue.get(ctx.chat.id).updateInterval);
    queue.get(ctx.chat.id).npMessageId = npMsg.message_id;

    const interval = setInterval(async () => {
      const qState = queue.get(ctx.chat.id);
      if (!qState || !qState.playing || !qState.npMessageId) return clearInterval(interval);
      try {
        await ctx.api.editMessageCaption(ctx.chat.id, qState.npMessageId, {
          caption: nowPlayingText(next, qState),
          parse_mode: "HTML", reply_markup: controls(false)
        });
      } catch (e) {
        if (e.message.includes("not found")) clearInterval(interval);
      }
    }, 30000);
    queue.get(ctx.chat.id).updateInterval = interval;

    await ctx.answerCallbackQuery("✨ skipped");
  });
};
