require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
const express = require("express");

// ===============================
// CONFIG
// ===============================
const CHANNEL_NAME = process.env.CHANNEL_NAME || "voting";
const VOTES_REQUIRED = parseInt(process.env.VOTES_REQUIRED || "3");

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
let latestGroupMeMessageId = null;

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

// ===============================
// AUTO PIN (GROUPME)
// ===============================
async function pinLatestGroupMeMessage(messageId) {
  if (!messageId) return;

  try {
    await fetch(`https://api.groupme.com/v3/messages/${messageId}/pin?token=${process.env.GROUPME_ACCESS_TOKEN}`, {
      method: "POST"
    });
  } catch (err) {
    console.log("Pin failed (GroupMe limitation likely):", err.message);
  }
}

// ===============================
// CHECK BILL END
// ===============================
function checkBillEnd(billId) {
  const bill = votes[billId];
  if (!bill) return;

  const yesCount = bill.yes.size;
  const noCount = bill.no.size;

  if (yesCount + noCount < VOTES_REQUIRED) return;

  const result = yesCount > noCount ? "PASSED" : "FAILED";

  const finalMsg = `📜 ${billId} RESULT: ${result}
✅ ${yesCount} | ❌ ${noCount}
(Needed ${VOTES_REQUIRED})`;

  sendToAllChannels(finalMsg);

  fetch("https://api.groupme.com/v3/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bot_id: GROUPME_BOT_ID,
      text: finalMsg
    })
  });

  delete votes[billId];
}

// ===============================
// CREATE BILL (!bill)
// ===============================
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.channel.name !== CHANNEL_NAME) return;
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

  // Send to GroupMe
  const groupmeRes = await fetch("https://api.groupme.com/v3/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bot_id: GROUPME_BOT_ID,
      text: msgText + "\n\nVote with:\n✅ or ❌"
    })
  });

  // Try to store latest message for pinning (best-effort)
  try {
    const data = await groupmeRes.json();
    if (data?.response?.message_id) {
      latestGroupMeMessageId = data.response.message_id;
      await pinLatestGroupMeMessage(latestGroupMeMessageId);
    }
  } catch (e) {
    // ignore
  }
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

  const voter = user.username;
  const emoji = reaction.emoji.name;

  const prev = votes[billId].voters.get(voter);
  if (prev === "yes") votes[billId].yes.delete(voter);
  if (prev === "no") votes[billId].no.delete(voter);

  if (emoji === "✅") {
    votes[billId].yes.add(voter);
    votes[billId].voters.set(voter, "yes");
  }

  if (emoji === "❌") {
    votes[billId].no.add(voter);
    votes[billId].voters.set(voter, "no");
  }

  const yesCount = votes[billId].yes.size;
  const noCount = votes[billId].no.size;

  sendToAllChannels(`📊 ${billId}\n✅ ${yesCount} | ❌ ${noCount}`);

  checkBillEnd(billId);
});

// ===============================
// GROUPME VOTING
// ===============================
app.post("/groupme", async (req, res) => {
  const data = req.body;

  if (!data.text || data.sender_type === "bot") {
    return res.sendStatus(200);
  }

  const text = data.text.trim();
  const voter = data.name;

  const billIds = Object.keys(votes);
  if (billIds.length === 0) return res.sendStatus(200);

  const billId = billIds[billIds.length - 1];

  if (text !== "✅" && text !== "❌") {
    return res.sendStatus(200);
  }

  const prev = votes[billId].voters.get(voter);
  if (prev === "yes") votes[billId].yes.delete(voter);
  if (prev === "no") votes[billId].no.delete(voter);

  if (text === "✅") {
    votes[billId].yes.add(voter);
    votes[billId].voters.set(voter, "yes");
  } else {
    votes[billId].no.add(voter);
    votes[billId].voters.set(voter, "no");
  }

  const yesCount = votes[billId].yes.size;
  const noCount = votes[billId].no.size;

  sendToAllChannels(`📊 ${billId}\n✅ ${yesCount} | ❌ ${noCount}`);

  checkBillEnd(billId);

  res.sendStatus(200);
});

// ===============================
app.listen(process.env.PORT || 8080, () => {
  console.log("Bot running on port", process.env.PORT || 8080);
});

client.login(DISCORD_TOKEN);
