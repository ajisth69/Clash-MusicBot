const saavn = require("../helpers/jiosaavn");
const queue = require("../helpers/player");
const db = require("../database");
const { searchText, nowPlayingText } = require("../helpers/utils");
const { searchBtns, controls } = require("../helpers/keyboard");

module.exports = (bot) => {
  bot.command("search", async (ctx) => {
    const q = ctx.match?.trim();
    if (!q) return ctx.reply("search what? /search [song name]");

    const msg = await ctx.reply("🔍 hold on...");
    const results = await saavn.search(q, 5);

    if (!results.length) {
      return ctx.api.editMessageText(ctx.chat.id, msg.message_id, "nothing found, try different words");
    }

    const songs = results.map(r => saavn.fmt(r));
    await ctx.api.editMessageText(ctx.chat.id, msg.message_id, searchText(songs), {
      parse_mode: "HTML", reply_markup: searchBtns(songs),
    });
  });

  // user picked a song from search
  bot.callbackQuery(/^pick:(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    await ctx.answerCallbackQuery("loading...");

    const raw = await saavn.getById(id);
    const song = saavn.fmt(raw);
    if (!song?.url) return ctx.editMessageText("failed to load that one :/");

    const pos = queue.add(ctx.chat.id, song);

    if (pos === 1) {
      queue.setPlaying(ctx.chat.id, true);
      db.incPlayed().catch(() => {});

      await ctx.deleteMessage().catch(()=>{});
      const photoUrl = song.image || "https://telegra.ph/file/bcab0474ceae72b8c5ea9.jpg";
      const npMsg = await ctx.api.sendPhoto(ctx.chat.id, photoUrl, {
        caption: nowPlayingText(song, queue.info(ctx.chat.id)),
        parse_mode: "HTML", reply_markup: controls(false),
      });

      if (queue.get(ctx.chat.id).updateInterval) clearInterval(queue.get(ctx.chat.id).updateInterval);
      queue.get(ctx.chat.id).npMessageId = npMsg.message_id;

      const interval = setInterval(async () => {
        const qState = queue.get(ctx.chat.id);
        if (!qState || !qState.playing || !qState.npMessageId) return clearInterval(interval);
        try {
          await ctx.api.editMessageCaption(ctx.chat.id, qState.npMessageId, {
            caption: nowPlayingText(song, qState),
            parse_mode: "HTML", reply_markup: controls(false)
          });
        } catch (e) {
          if (e.message.includes("not found")) clearInterval(interval);
        }
      }, 30000);
      queue.get(ctx.chat.id).updateInterval = interval;

    } else {
      await ctx.editMessageText(`queued #${pos}\n\n🎵 <b>${song.name}</b>\n👤 ${song.artists}`, { parse_mode: "HTML" });
    }
  });
};
