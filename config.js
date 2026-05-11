require("dotenv").config();

const c = {
  token: process.env.BOT_TOKEN || "",
  apiId: parseInt(process.env.API_ID) || 0,
  apiHash: process.env.API_HASH || "",
  session: process.env.STRING_SESSION || "",

  ownerId: parseInt(process.env.OWNER_ID) || 0,
  ownerUsername: process.env.OWNER_USERNAME || "ajisth",
  botName: process.env.BOT_NAME || "Clash Music",
  sudoUsers: (process.env.SUDO_USERS || "")
    .split(",")
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id)),

  dbUrl: process.env.CLASH_DB_URL || "https://clashdb0.vercel.app",
  dbKey: process.env.CLASH_DB_KEY || "",

  logChannel: parseInt(process.env.LOG_CHANNEL) || 0,
  maxQueue: parseInt(process.env.MAX_QUEUE_SIZE) || 50,
  defVolume: parseInt(process.env.DEFAULT_VOLUME) || 100,

  picStart: process.env.PIC_START || "https://telegra.ph/file/bcab0474ceae72b8c5ea9.jpg",
  picPing: process.env.PIC_PING || "https://telegra.ph/file/bcab0474ceae72b8c5ea9.jpg",
  picHelp: process.env.PIC_HELP || "https://telegra.ph/file/bcab0474ceae72b8c5ea9.jpg",
  picReload: process.env.PIC_RELOAD || "https://telegra.ph/file/bcab0474ceae72b8c5ea9.jpg",
};

// make sure the important stuff is there
function validate() {
  let missing = [];
  if (!c.token) missing.push("BOT_TOKEN");
  if (!c.apiId) missing.push("API_ID");
  if (!c.apiHash) missing.push("API_HASH");
  if (!c.ownerId) missing.push("OWNER_ID");

  if (missing.length) {
    console.error("\n✗ missing env vars:", missing.join(", "));
    console.error("  → copy .env.example to .env and fill them in\n");
    process.exit(1);
  }

  if (!c.session) console.log("  ! no STRING_SESSION - vc features off");
  if (!c.dbKey) console.log("  ! no CLASH_DB_KEY - db features off");
}

const isOwner = (id) => id === c.ownerId;
const isSudo = (id) => isOwner(id) || c.sudoUsers.includes(id);

module.exports = { config: c, validate, isOwner, isSudo };
