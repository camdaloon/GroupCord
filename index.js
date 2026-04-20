require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
const express = require("express");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const app = express();
app.use(express.json());

const CHANNEL_NAME = "voting";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GROUPME_BOT_ID = process.env.GROUPME_BOT_ID;

// Store votes
const votes = {};

// Helper: send message to ALL servers
function sendToAllChannels(message) {
  client.guilds.cache.forEach(guild => {
    const channel = guild.channels.cache.find(
      c => c.name === CHANNEL_NAME
    );
    if (channel) channel.send(message);
  });
}

// --------------------
// Discord → GroupMe (create bill)
// --------------------
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.channel.name !== CHANNEL_NAME) return;

  const billId = `BILL-${Date.now()}`;

  votes[billId] = {
    yes: new Set(),
    no: new Set(),
    voters: new Map(),
    text: message.content
  };

  await fetch("https://api.groupme.com/v3/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bot_id: GROUPME_BOT_ID,
      text: `📜 [${billId}]
${message.author.username}: ${message.content}

Vote by sending:
✅ = YES
❌ = NO`
    })
  });
});

// --------------------
// GroupMe → Discord (handle votes)
// --------------------
app.post("/groupme", async (req, res) => {
  const data = req.body;

  if (!data.text || data.sender_type === "bot") {
    return res.sendStatus(200);
  }

  const text = data.text.trim();
  const voter = data.name;

  // Get latest bill
  const billIds = Object.keys(votes);
  if (billIds.length === 0) return res.sendStatus(200);

  const billId = billIds[billIds.length - 1];

  // Only allow emoji votes
  if (text !== "✅" && text !== "❌") {
    return res.sendStatus(200);
  }

  // Remove previous vote
  const previous = votes[billId].voters.get(voter);

  if (previous === "yes") votes[billId].yes.delete(voter);
  if (previous === "no") votes[billId].no.delete(voter);

  // Add new vote
  if (text === "✅") {
    votes[billId].yes.add(voter);
    votes[billId].voters.set(voter, "yes");
  }

  if (text === "❌") {
    votes[billId].no.add(voter);
    votes[billId].voters.set(voter, "no");
  }

  const yesCount = votes[billId].yes.size;
  const noCount = votes[billId].no.size;

  // Send live update to Discord
  sendToAllChannels(
    `📊 ${billId} Votes:\n✅ ${yesCount} | ❌ ${noCount}`
  );

  // Auto-finish at 3 votes (you can change this number)
  if (yesCount + noCount >= 3) {
    const result = yesCount > noCount ? "PASSED" : "FAILED";

    const finalMsg = `📜 ${billId} RESULT: ${result}\n✅ ${yesCount} | ❌ ${noCount}`;

    sendToAllChannels(finalMsg);

    await fetch("https://api.groupme.com/v3/bots/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bot_id: GROUPME_BOT_ID,
        text: finalMsg
      })
    });

    delete votes[billId];
  }

  res.sendStatus(200);
});

// --------------------
app.listen(process.env.PORT || 8080, () => {
  console.log("Webhook running on port", process.env.PORT || 8080);
});

client.login(DISCORD_TOKEN);
