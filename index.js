const votes = {};
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

// ================= CONFIG =================
const CHANNEL_NAME = "voting";
const GUILD_ID = process.env.GUILD_ID;

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GROUPME_BOT_ID = process.env.GROUPME_BOT_ID;
// =========================================

// --------------------
// Discord → GroupMe
// --------------------
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.channel.name !== "voting") return;

  const billId = `BILL-${Date.now()}`;

votes[billId] = {
  yes: new Set(),
  no: new Set(),
  voters: new Map(), // NEW
  text: message.content
};

await fetch("https://api.groupme.com/v3/bots/post", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    bot_id: process.env.GROUPME_BOT_ID,
    text: `📜 [${billId}]
${message.author.username}: ${message.content}

Vote by sending:
✅ = YES
❌ = NO`
  })
});

// --------------------
// GroupMe → Discord
// --------------------
app.post("/groupme", async (req, res) => {
  const data = req.body;

  if (!data.text || data.sender_type === "bot") {
    return res.sendStatus(200);
  }

  const text = data.text.toUpperCase();

  let foundBill = Object.keys(votes)[Object.keys(votes).length - 1];
  if (!foundBill) return res.sendStatus(200);

  if (text.includes("YES")) {
    votes[foundBill].yes.add(data.name);
  }

  if (text.includes("NO")) {
    votes[foundBill].no.add(data.name);
  }

  const guilds = client.guilds.cache;

  const resultChannelSend = (msg) => {
    guilds.forEach(g => {
      const channel = g.channels.cache.find(c => c.name === "voting");
      if (channel) channel.send(msg);
    });
  };

  const yesCount = votes[foundBill].yes.size;
  const noCount = votes[foundBill].no.size;

  if (yesCount + noCount >= 3) {
    const result = yesCount > noCount ? "PASSED" : "FAILED";

    resultChannelSend(
      `📜 ${foundBill} RESULT: ${result}\nYES: ${yesCount} | NO: ${noCount}`
    );

    await fetch("https://api.groupme.com/v3/bots/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bot_id: process.env.GROUPME_BOT_ID,
        text: `📜 ${foundBill} RESULT: ${result} (YES: ${yesCount}, NO: ${noCount})`
      })
    });

    delete votes[foundBill];
  }

  res.sendStatus(200);
});

// --------------------
// Start webhook server
// --------------------
app.listen(process.env.PORT || 8080, () => {
  console.log("Webhook running on port", process.env.PORT || 8080);
});

// --------------------
// Start Discord bot
// --------------------
client.login(DISCORD_TOKEN);
