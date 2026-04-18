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

  // LOCK TO ONE SERVER
  if (message.guild.id !== GUILD_ID) return;

  // LOCK TO CHANNEL NAME
  if (message.channel.name !== CHANNEL_NAME) return;

  try {
    await fetch("https://api.groupme.com/v3/bots/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bot_id: GROUPME_BOT_ID,
        text: `${message.author.username}: ${message.content}`
      })
    });
  } catch (err) {
    console.error("GroupMe send error:", err);
  }
});

// --------------------
// GroupMe → Discord
// --------------------
app.post("/groupme", async (req, res) => {
  const data = req.body;

  if (!data.text || data.sender_type === "bot") {
    return res.sendStatus(200);
  }

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return res.sendStatus(200);

  const channel = guild.channels.cache.find(
    c => c.name === CHANNEL_NAME
  );

  if (channel) {
    channel.send(`[GroupMe] ${data.name}: ${data.text}`);
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
