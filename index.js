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
const billToMessage = {};
let latestBillId = null;

// ===============================
// GROUPME SEND
// ===============================
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
// UPDATE DISCORD MESSAGE
// ===============================
async function updateDiscordMessage(billId) {
  const bill = votes[billId];
  const msg = billToMessage[billId];
  if (!bill || !msg) return;

  const yes = bill.yes.size;
  const no = bill.no.size;

  const lines = msg.content.split("\n");
  const billTextLine = lines[1] || "";

  const updated = `📜 [${billId}]
${billTextLine}

React to vote:
✅ = YES
❌ = NO

📊 Votes:
✅ ${yes} | ❌ ${no}`;

  try {
    await msg.edit(updated);
  } catch (e) {
    console.log("Discord edit failed:", e.message);
  }
}

// ===============================
// GROUPME REPOST (WITH DESCRIPTION)
// ===============================
async function repostBillToGroupMe(billId) {
  const bill = votes[billId];
  if (!bill) return;

  const text = `📌 CURRENT BILL
[${billId}]

📄 ${bill.text}

📊 Votes:
✅ ${bill.yes.size} | ❌ ${bill.no.size}

Vote with:
✅ / ❌ / yes / no`;

  await sendToGroupMe(text);
}

// ===============================
// END BILL
// ===============================
function endBill(billId) {
  const bill = votes[billId];
  if (!bill) return;

  const yes = bill.yes.size;
  const no = bill.no.size;

  const result = yes > no ? "PASSED" : "FAILED";

  const finalMsg = `📜 ${billId} RESULT: ${result}
📄 ${bill.text}

✅ ${yes} | ❌ ${no}`;

  const msg = billToMessage[billId];
  if (msg) msg.edit(finalMsg);

  sendToGroupMe(finalMsg);

  delete votes[billId];
  delete billToMessage[billId];
  latestBillId = null;
}

// ===============================
// CREATE BILL
// ===============================
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.channel.name !== CHANNEL_NAME) return;

  // END COMMAND
  if (message.content === "!voteend") {
    if (!latestBillId) return message.channel.send("❌ No active bill");
    endBill(latestBillId);
    return;
  }

  // CREATE BILL
  if (!message.content.startsWith("!bill ")) return;

  const raw = message.content.slice(6).trim();
  const parts = raw.split("|");

  let billName = parts[0]?.trim();
  const billText = parts[1]?.trim();

  if (!billText) {
    return message.channel.send("❌ Use: !bill <name> | <text>");
  }

  if (!billName) billName = `Bill-${Date.now()}`;

  const billId = billName;
  latestBillId = billId;

  votes[billId] = {
    yes: new Set(),
    no: new Set(),
    voters: new Map(),
    text: billText
  };

  const msgText = `📜 [${billId}]
${message.author.username}: ${billText}

React to vote:
✅ = YES
❌ = NO

📊 Votes:
✅ 0 | ❌ 0`;

  const sentMsg = await message.channel.send(msgText);

  await sentMsg.react("✅");
  await sentMsg.react("❌");

  messageToBill[sentMsg.id] = billId;
  billToMessage[billId] = sentMsg;

  await sendToGroupMe(`📌 NEW BILL\n[${billId}]\n\n📄 ${billText}\n\nVote: ✅ / ❌`);
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

  const bill = votes[billId];
  if (!bill) return;

  const voter = user.username;
  const emoji = reaction.emoji.name;

  const reactions = reaction.message.reactions.cache;

  try {
    if (emoji === "✅") {
      const opposite = reactions.get("❌");
      if (opposite) await opposite.users.remove(user.id);
    }
    if (emoji === "❌") {
      const opposite = reactions.get("✅");
      if (opposite) await opposite.users.remove(user.id);
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

  await updateDiscordMessage(billId);
  await repostBillToGroupMe(billId);
});

// ===============================
// GROUPME VOTING
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

  await updateDiscordMessage(latestBillId);
  await repostBillToGroupMe(latestBillId);

  res.sendStatus(200);
});

// ===============================
app.listen(process.env.PORT || 8080, () => {
  console.log("Bot running on port", process.env.PORT || 8080);
});

client.login(DISCORD_TOKEN);
