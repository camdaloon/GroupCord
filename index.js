require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
const express = require("express");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions // IMPORTANT
  ]
});

const app = express();
app.use(express.json());

const CHANNEL_NAME = "voting";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GROUPME_BOT_ID = process.env.GROUPME_BOT_ID;

const votes = {};
const messageToBill = {}; // maps discord message → bill

function sendToAllChannels(message) {
  client.guilds.cache.forEach(guild => {
    const channel = guild.channels.cache.find(c => c.name === CHANNEL_NAME);
    if (channel) channel.send(message);
  });
}

// ===============================
// CREATE BILL
// ===============================
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.channel.name !== CHANNEL_NAME) return;

  if (!message.content.startsWith("!bill ")) return;

  const billText = message.content.slice(6).trim();
  if (!billText) return;

  const billId = `BILL-${Date.now()}`;

  votes[billId] = {
    yes: new Set(),
    no: new Set(),
    voters: new Map()
  };

  const msgText = `📜 [${billId}]
${message.author.username}: ${billText}

React below to vote:
✅ = YES
❌ = NO`;

  // Send to Discord
  const sentMsg = await message.channel.send(msgText);

  // Add reactions automatically
  await sentMsg.react("✅");
  await sentMsg.react("❌");

  // Link message to bill
  messageToBill[sentMsg.id] = billId;

  // Send to GroupMe
  await fetch("https://api.groupme.com/v3/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bot_id: GROUPME_BOT_ID,
      text: msgText + "\n\nVote by sending ✅ or ❌"
    })
  });
});

// ===============================
// DISCORD REACTION VOTING
// ===============================
client.on("messageReactionAdd", (reaction, user) => {
  if (user.bot) return;

  const billId = messageToBill[reaction.message.id];
  if (!billId) return;

  const voter = user.username;

  // Remove previous vote
  const prev = votes[billId].voters.get(voter);
  if (prev === "yes") votes[billId].yes.delete(voter);
  if (prev === "no") votes[billId].no.delete(voter);

  if (reaction.emoji.name === "✅") {
    votes[billId].yes.add(voter);
    votes[billId].voters.set(voter, "yes");
  }

  if (reaction.emoji.name === "❌") {
    votes[billId].no.add(voter);
    votes[billId].voters.set(voter, "no");
  }

  const yesCount = votes[billId].yes.size;
  const noCount = votes[billId].no.size;

  const updateMsg = `📊 ${billId} Votes:\n✅ ${yesCount} | ❌ ${noCount}`;

  sendToAllChannels(updateMsg);
});

// ===============================
// GROUPME → DISCORD VOTING
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

  const updateMsg = `📊 ${billId} Votes:\n✅ ${yesCount} | ❌ ${noCount}`;

  sendToAllChannels(updateMsg);

  res.sendStatus(200);
});

// ===============================
app.listen(process.env.PORT || 8080, () => {
  console.log("Webhook running on port", process.env.PORT || 8080);
});

client.login(DISCORD_TOKEN);
