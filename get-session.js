const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

// REPLACE THESE with your data from https://my.telegram.org
const apiId = 30555473; // Enter your API_ID here
const apiHash = "986b8ae7d3aeca15f397dcac66bd9505"; // Enter your API_HASH here

const stringSession = new StringSession(""); 

(async () => {
  console.log("--- GramJS Session Generator ---");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Enter phone number (+xxxx): "),
    password: async () => await input.text("Enter 2FA password: "),
    phoneCode: async () => await input.text("Enter code from Telegram: "),
    onError: (err) => console.log(err),
  });

  const mySession = client.session.save();
  console.log("\n✅ YOUR GRAMJS SESSION STRING:");
  console.log("-------------------------------");
  console.log(mySession);
  console.log("-------------------------------\n");
  
  await client.sendMessage("me", { message: `Your GramJS Session String:\n\n\`${mySession}\`` });
  console.log("The string has also been sent to your Saved Messages.");
  process.exit(0);
})();
