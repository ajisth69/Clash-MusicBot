const { config, isOwner, isSudo } = require("../config");
const db = require("../database");
const queue = require("../helpers/player");
const { uptime, esc } = require("../helpers/utils");
const { closeBtn } = require("../helpers/keyboard");

function ownerCheck(ctx, next) {
  if (!isSudo(ctx.from?.id)) return ctx.reply("nah, owner only");
  return next();
}

module.exports = (bot) => {

  // broadcast to all active chats
  bot.command("broadcast", ownerCheck, async (ctx) => {
    const text = ctx.match?.trim();
    if (!text) return ctx.reply("/broadcast [message]");

    const msg = await ctx.reply("sending...");
    const chats = queue.activeChats();
    let ok = 0, fail = 0;

    for (const id of chats) {
      try {
        await ctx.api.sendMessage(id, `📢 <b>broadcast</b>\n\n${text}`, { parse_mode: "HTML" });
        ok++;
      } catch (_) { fail++; }
    }

    await ctx.api.editMessageText(ctx.chat.id, msg.message_id,
      `done — sent: ${ok}, failed: ${fail}`
    );
  });

  // bot stats
  bot.command("stats", async (ctx) => {
    const s = await db.getStats();
    const mem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const up = uptime(process.uptime() * 1000);
    const active = queue.activeChats().length;

    await ctx.reply(
      `📊 <b>${config.botName}</b>\n\n` +
      `songs played: ${s.played || 0}\n` +
      `active queues: ${active}\n` +
      `uptime: ${up}\n` +
      `ram: ${mem}mb\n` +
      `status: 🟢 online`,
      { parse_mode: "HTML", reply_markup: closeBtn() }
    );
  });

  // stats from start button
  bot.callbackQuery("go:stats", async (ctx) => {
    const s = await db.getStats();
    await ctx.answerCallbackQuery(`🎵 ${s.played || 0} played | ⏱ ${uptime(process.uptime() * 1000)}`);
  });

  // ban user
  bot.command("ban", ownerCheck, async (ctx) => {
    const uid = parseInt(ctx.match?.trim());
    if (!uid) return ctx.reply("/ban [user id]");
    await db.ban(uid);
    await ctx.reply(`banned ${uid} 🚫`);
  });

  // unban user
  bot.command("unban", ownerCheck, async (ctx) => {
    const uid = parseInt(ctx.match?.trim());
    if (!uid) return ctx.reply("/unban [user id]");
    await db.unban(uid);
    await ctx.reply(`unbanned ${uid} ✅`);
  });

  // eval - owner only, not sudo
  bot.command("eval", async (ctx) => {
    if (!isOwner(ctx.from?.id)) return;
    const code = ctx.match?.trim();
    if (!code) return ctx.reply("/eval [js code]");

    try {
      let result = eval(code);
      if (result instanceof Promise) result = await result;
      const out = typeof result === "string" ? result : JSON.stringify(result, null, 2);
      const safe = (out || "undefined").slice(0, 3000);
      await ctx.reply(`<pre>${esc(safe)}</pre>`, { parse_mode: "HTML" });
    } catch (e) {
      await ctx.reply(`err: <pre>${esc(e.message)}</pre>`, { parse_mode: "HTML" });
    }
  });

  // reload
  bot.command("reload", ownerCheck, async (ctx) => {
    await ctx.replyWithPhoto(config.picReload, { caption: "reloading..." });
    setTimeout(() => process.exit(0), 500);
  });
};
