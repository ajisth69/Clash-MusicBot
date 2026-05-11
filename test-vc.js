const { TGCallsJs, gramjs } = require("tgcallsjs");
const { config } = require("./config");

(async () => {
  try {
    const client = await gramjs(config.apiId, config.apiHash, config.session);
    console.log("Client connected!");
    const tg = new TGCallsJs(client, "me");
    console.log("TGCalls created!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
