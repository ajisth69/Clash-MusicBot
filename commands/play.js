const saavn = require("../helpers/jiosaavn");
const queue = require("../helpers/player");
const db = require("../database");
const { nowPlayingText } = require("../helpers/utils");
const { controls } = require("../helpers/keyboard");

module.exports = (bot) => {
  bot.command("play", async (ctx) => {
    const q = ctx.match?.trim();
    if (!q) return ctx.reply("what should i play? do /play [song name]");

    const msg = await ctx.reply(`🔍 searching: <b>${q}</b>`, { parse_mode: "HTML" });

    let song;

    // check if its a jiosaavn link
    if (q.includes("jiosaavn.com") || q.includes("saavn.com")) {
      const raw = await saavn.getByLink(q);
      song = saavn.fmt(raw);
    } else {
      const results = await saavn.search(q, 1);
      if (results.length) song = saavn.fmt(results[0]);
    }

    if (!song || !song.url) {
      return ctx.api.editMessageText(ctx.chat.id, msg.message_id,
        "❌ couldnt find that song, try different keywords"
      );
    }

    const pos = queue.add(ctx.chat.id, song);
    if (pos === -1) {
      return ctx.api.editMessageText(ctx.chat.id, msg.message_id, "queue full! /stop to clear");
    }

    const qi = queue.info(ctx.chat.id);

    if (pos === 1) {
      // first song, play it
      queue.setPlaying(ctx.chat.id, true);
      db.incPlayed().catch(() => {});
      await ctx.api.deleteMessage(ctx.chat.id, msg.message_id).catch(() => {});

      // send now playing photo
      const photoUrl = song.image || "https://telegra.ph/file/bcab0474ceae72b8c5ea9.jpg";
      const npMsg = await ctx.replyWithPhoto(photoUrl, {
        caption: nowPlayingText(song, qi),
        parse_mode: "HTML", reply_markup: controls(false),
      });

      // start dynamic progress bar
      if (queue.get(ctx.chat.id).updateInterval) {
        clearInterval(queue.get(ctx.chat.id).updateInterval);
      }
      queue.get(ctx.chat.id).npMessageId = npMsg.message_id;
      
      const interval = setInterval(async () => {
        const qState = queue.get(ctx.chat.id);
        if (!qState || !qState.playing || !qState.npMessageId) return clearInterval(interval);
        
        try {
          const currentSong = qState.songs[qState.pos] || song;
          await ctx.api.editMessageCaption(ctx.chat.id, qState.npMessageId, {
            caption: nowPlayingText(currentSong, qState),
            parse_mode: "HTML", reply_markup: controls(false)
          });
        } catch (e) {
          // stop interval if message deleted or not modified
          if (e.message.includes("message to edit not found")) clearInterval(interval);
        }
      }, 30000); // update every 30s to avoid blocking audio stream
      queue.get(ctx.chat.id).updateInterval = interval;

    } else {
      await ctx.api.editMessageText(ctx.chat.id, msg.message_id,
        `✅ queued #${pos}\n\n🎵 <b>${song.name}</b>\n👤 ${song.artists}`,
        { parse_mode: "HTML" }
      );
    }
  });
};
