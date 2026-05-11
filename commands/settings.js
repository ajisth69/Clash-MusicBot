const db = require("../database");
const { settingsKb } = require("../helpers/keyboard");

module.exports = (bot) => {
  bot.command("settings", async (ctx) => {
    if (ctx.chat.type === "private") return ctx.reply("settings only work in groups");

    // check if user is admin
    try {
      const m = await ctx.api.getChatMember(ctx.chat.id, ctx.from.id);
      if (!["creator", "administrator"].includes(m.status)) {
        return ctx.reply("only admins can change settings");
      }
    } catch (_) {}

    const s = await db.getSettings(ctx.chat.id);
    await ctx.reply("⚙️ <b>settings</b>", { parse_mode: "HTML", reply_markup: settingsKb(s) });
  });

  bot.callbackQuery("set:admin", async (ctx) => {
    const s = await db.getSettings(ctx.chat.id);
    s.adminOnly = !s.adminOnly;
    await db.setSettings(ctx.chat.id, s);
    await ctx.editMessageReplyMarkup({ reply_markup: settingsKb(s) });
    await ctx.answerCallbackQuery(`admin only: ${s.adminOnly ? "on" : "off"}`);
  });

  bot.callbackQuery("set:vol", async (ctx) => {
    await ctx.answerCallbackQuery("use /volume to change");
  });
};
