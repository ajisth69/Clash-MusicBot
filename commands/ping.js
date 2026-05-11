const { uptime } = require("../helpers/utils");
const { config } = require("../config");
const { getClient } = require("../helpers/player");
const fetch = require("node-fetch");
const { Api } = require("telegram");

module.exports = (bot) => {
  bot.command("ping", async (ctx) => {
    const start = Date.now();
    const m = await ctx.reply("🏓 checking systems...").catch(()=>{});
    const botPing = Date.now() - start;

    const apiStart = Date.now();
    await fetch("https://jiosaavn-api-two-beta.vercel.app/api").catch(()=>{});
    const apiPing = Date.now() - apiStart;

    let userbotPing = "offline";
    const userbot = getClient();
    if (userbot) {
      const ubStart = Date.now();
      await userbot.invoke(new Api.Ping({ pingId: BigInt(0) })).catch(()=>{});
      userbotPing = `${Date.now() - ubStart}ms`;
    }

    const text = `🏓 <b>Pong!</b>\n\n🤖 <b>Bot Ping:</b> ${botPing}ms\n🎵 <b>API Ping:</b> ${apiPing}ms\n📞 <b>Voice Ping:</b> ${userbotPing}\n\n⏱ <b>Uptime:</b> ${uptime(process.uptime() * 1000)}`;

    if (m) await ctx.api.deleteMessage(ctx.chat.id, m.message_id).catch(()=>{});

    await ctx.replyWithPhoto(config.picPing || "https://placehold.co/600x400.png", {
      caption: text,
      parse_mode: "HTML"
    }).catch(() => {
      ctx.reply(text, { parse_mode: "HTML" });
    });
  });
};
