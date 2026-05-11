// clash music bot - main entry
process.env.UV_THREADPOOL_SIZE = "128";

const { Bot } = require("grammy");
const { config, validate, isSudo } = require("./config");
const db = require("./database");

validate();

const bot = new Bot(config.token);

// --- middleware ---

// block banned users
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (await db.isBanned(ctx.from.id)) return; // silently ignore
  return next();
});

// admin-only mode for groups
bot.use(async (ctx, next) => {
  if (!ctx.message?.text?.startsWith("/")) return next();
  if (ctx.chat?.type === "private") return next();
  if (isSudo(ctx.from?.id)) return next();

  const s = await db.getSettings(ctx.chat.id);
  if (s?.adminOnly) {
    try {
      const m = await ctx.api.getChatMember(ctx.chat.id, ctx.from.id);
      if (!["creator", "administrator"].includes(m.status)) return;
    } catch (_) {}
  }
  return next();
});

// track chats
bot.use(async (ctx, next) => {
  if (ctx.chat && ctx.chat.type !== "private") {
    db.trackChat(ctx.chat.id, ctx.chat.title || "?").catch(() => {});
  }
  return next();
});

// --- load commands ---

const cmds = [
  "start", "help", "play", "pause", "resume", "skip", "stop",
  "queue", "nowplaying", "search", "remove",
  "ping", "settings", "owner",
];

console.log("\n  clash music bot v2.0\n");

cmds.forEach(c => {
  try {
    require(`./commands/${c}`)(bot);
    console.log(`  ✓ ${c}`);
  } catch (e) {
    console.log(`  ✗ ${c}: ${e.message}`);
  }
});

// --- inline button handlers for pause/resume/prev ---

bot.callbackQuery("ctrl:pause", async (ctx) => {
  const queue = require("./helpers/player");
  const { nowPlayingText } = require("./helpers/utils");
  const { controls } = require("./helpers/keyboard");
  queue.setPlaying(ctx.chat.id, false);
  const s = queue.current(ctx.chat.id);
  if (s) {
    await ctx.editMessageCaption({
      caption: nowPlayingText(s, queue.info(ctx.chat.id)),
      parse_mode: "HTML", reply_markup: controls(true),
    }).catch(()=>{});
  }
  await ctx.answerCallbackQuery("🔴 paused");
});

bot.callbackQuery("ctrl:resume", async (ctx) => {
  const queue = require("./helpers/player");
  const { nowPlayingText } = require("./helpers/utils");
  const { controls } = require("./helpers/keyboard");
  queue.setPlaying(ctx.chat.id, true);
  const s = queue.current(ctx.chat.id);
  if (s) {
    await ctx.editMessageCaption({
      caption: nowPlayingText(s, queue.info(ctx.chat.id)),
      parse_mode: "HTML", reply_markup: controls(false),
    }).catch(()=>{});
  }
  await ctx.answerCallbackQuery("▶️ resumed");
});

bot.callbackQuery("ctrl:prev", async (ctx) => {
  await ctx.answerCallbackQuery("coming soon");
});

// --- error handler ---

bot.catch((err) => {
  console.error("bot error:", err.error?.message || err.message || err);
});

// --- start ---

async function run() {
  if (config.session) {
    const { gramjs } = require("tgcallsjs");
    try {
      console.log("  starting userbot...");
      const userbot = await gramjs(config.apiId, config.apiHash, config.session);
      const queue = require("./helpers/player");
      queue.setClient(userbot);
      console.log("  userbot connected ✓");
    } catch (e) {
      console.log("  ✗ userbot error:", e.message);
    }
  }

  await bot.api.setMyCommands([
    { command: "play", description: "play a song" },
    { command: "pause", description: "pause" },
    { command: "resume", description: "resume" },
    { command: "skip", description: "skip song" },
    { command: "stop", description: "stop & clear" },
    { command: "queue", description: "show queue" },
    { command: "np", description: "now playing" },
    { command: "search", description: "search songs" },
    { command: "remove", description: "remove from queue" },
    { command: "settings", description: "group settings" },
    { command: "ping", description: "latency" },
    { command: "help", description: "all commands" },
    { command: "reload", description: "reload bot (owner)" },
  ]);

  if (config.logChannel) {
    await bot.api.sendMessage(config.logChannel,
      `🟢 ${config.botName} started`
    ).catch(() => {});
  }

  console.log("\n  bot running ✓\n");
  bot.start();
}

run().catch(console.error);
