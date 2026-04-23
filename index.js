require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
const express = require("express");

// ===============================
// CONFIG
// ===============================
const CHANNEL_NAME = process.env.CHANNEL_NAME || "voting";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GROUPME_BOT_ID = process.env.GROUPME_BOT_ID;

// ===============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"]
});

const app = express();
app.use(express.json());

// ===============================
// STORAGE
// ===============================
const votes = {};
const messageToBill = {};
let latestBillId = null;

// ===============================
// HELPERS
// ===============================
function sendToAllChannels(message) {
  client.guilds.cache.forEach(guild => {
    const channel = guild.channels.cache.find(
      c => c.name === CHANNEL_NAME
    );
    if (channel) channel.send(message);
  });
}

async function sendToGroupMe(text) {
  await fetch("https://api.groupme.com/v3/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bot_id: GROUPME_BOT_ID,
      text
    })
  });
}

// ===============================
// END BILL MANUALLY
// ===============================
function endBill(billId) {
  const bill = votes[billId];
  if (!bill) return;

  const yesCount = bill.yes.size;
  const noCount = bill.no.size;

  const result = yesCount > noCount ? "PASSED" : "FAILED";

  const finalMsg = `📜 ${billId} RESULT: ${result}
✅ ${yesCount} | ❌ ${noCount}`;

  sendToAllChannels(finalMsg);
  sendToGroupMe(finalMsg);

  delete votes[billId];
  latestBillId = null;
}

// ===============================
// CREATE BILL + COMMANDS
// ===============================
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.channel.name !== CHANNEL_NAME) return;

  // ===============================
  // END COMMAND
  // ===============================
  if (message.content === "!voteend") {
    if (!latestBillId) {
      message.channel.send("❌ No active bill");
      return;
    }

    endBill(latestBillId);
    return;
  }

  // ===============================
  // CREATE BILL
  // ===============================
  if (!message.content.startsWith("!bill ")) return;

  const raw = message.content.slice(6).trim();
  const parts = raw.split("|");

  let billName = parts[0]?.trim();
  const billText = parts[1]?.trim();

  if (!billText) {
    message.channel.send("❌ Use: !bill <name> | <text>");
    return;
  }

  if (!billName) billName = `Bill-${Date.now()}`;

  const billId = billName;
  latestBillId = billId;

  votes[billId] = {
    yes: new Set(),
    no: new Set(),
    voters: new Map()
  };

  const msgText = `📜 [${billId}]
${message.author.username}: ${billText}

React to vote:
✅ = YES
❌ = NO`;

  const sentMsg = await message.channel.send(msgText);

  await sentMsg.react("✅");
  await sentMsg.react("❌");

  messageToBill[sentMsg.id] = billId;

  // "Fake pin" (re-sent highlight message)
  await sendToGroupMe("📌 CURRENT BILL\n" + msgText + "\n\nVote with ✅ or ❌");
});

// ===============================
// DISCORD REACTIONS
// ===============================
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();

  const billId = messageToBill[reaction.message.id];
  if (!billId) return;

  const voterId = user.id;
  const voter = user.username;
  const emoji = reaction.emoji.name;

  const bill = votes[billId];
  if (!bill) return;

  const reactions = reaction.message.reactions.cache;

  try {
    if (emoji === "✅") {
      const opposite = reactions.get("❌");
      if (opposite) await opposite.users.remove(voterId);
    }

    if (emoji === "❌") {
      const opposite = reactions.get("✅");
      if (opposite) await opposite.users.remove(voterId);
    }
  } catch {}

  const prev = bill.voters.get(voter);
  if (prev === "yes") bill.yes.delete(voter);
  if (prev === "no") bill.no.delete(voter);

  if (emoji === "✅") {
    bill.yes.add(voter);
    bill.voters.set(voter, "yes");
  } else if (emoji === "❌") {
    bill.no.add(voter);
    bill.voters.set(voter, "no");
  }

  sendToAllChannels(`📊 ${billId}\n✅ ${bill.yes.size} | ❌ ${bill.no.size}`);
});

// ===============================
// GROUPME VOTING (FIXED)
// ===============================
app.post("/groupme", async (req, res) => {
  const data = req.body;

  if (!data.text || data.sender_type === "bot") {
    return res.sendStatus(200);
  }

  const text = data.text.trim().toLowerCase();
  const voter = data.name;

  if (!latestBillId) return res.sendStatus(200);

  const bill = votes[latestBillId];
  if (!bill) return res.sendStatus(200);

  // ACCEPT MULTIPLE INPUT TYPES
  let vote = null;

  if (text === "✅" || text === "yes" || text === "y") vote = "yes";
  if (text === "❌" || text === "no" || text === "n") vote = "no";

  if (!vote) return res.sendStatus(200);

  const prev = bill.voters.get(voter);
  if (prev === "yes") bill.yes.delete(voter);
  if (prev === "no") bill.no.delete(voter);

  if (vote === "yes") {
    bill.yes.add(voter);
    bill.voters.set(voter, "yes");
  } else {
    bill.no.add(voter);
    bill.voters.set(voter, "no");
  }

  sendToAllChannels(`📊 ${latestBillId}\n✅ ${bill.yes.size} | ❌ ${bill.no.size}`);

  res.sendStatus(200);
});

// ===============================
app.listen(process.env.PORT || 8080, () => {
  console.log("Bot running on port", process.env.PORT || 8080);
});

client.login(DISCORD_TOKEN);
