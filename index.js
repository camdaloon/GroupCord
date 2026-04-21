require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
const express = require("express");

// ===============================
// CONFIG (RAILWAY ENV CONTROLLED)
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
// CREATE BILL (!bill)
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

React to vote:
✅ = YES
❌ = NO`;

  const sentMsg = await message.channel.send(msgText);

  // Auto reactions
  await sentMsg.react("✅");
  await sentMsg.react("❌");

  messageToBill[sentMsg.id] = billId;

  // Send to GroupMe
  await fetch("https://api.groupme.com/v3/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bot_id: GROUPME_BOT_ID,
      text: msgText + `\n\nVote with:\n✅ or ❌`
    })
  });
});

// ===============================
// DISCORD REACTION VOTING (FIXED)
// ===============================
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();

  const billId = messageToBill[reaction.message.id];
  if (!billId) return;

  const voter = user.username;
  const emoji = reaction.emoji.name;

  try {
    const reactions = reaction.message.reactions.cache;

    // REMOVE opposite reaction (enforces single vote)
    if (emoji === "✅") {
      const opposite = reactions.get("❌");
      if (opposite) await opposite.users.remove(user.id);
    }

    if (emoji === "❌") {
      const opposite = reactions.get("✅");
      if (opposite) await opposite.users.remove(user.id);
    }
  } catch (err) {
    console.log("Reaction remove error:", err);
  }

  // Update vote system
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

  if (yesCount + noCount >= VOTES_REQUIRED) {
    const result = yesCount > noCount ? "PASSED" : "FAILED";

    const finalMsg = `📜 ${billId} RESULT: ${result}
✅ ${yesCount} | ❌ ${noCount}
(Needed ${VOTES_REQUIRED})`;

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

// ===============================
app.listen(process.env.PORT || 8080, () => {
  console.log("Bot running on port", process.env.PORT || 8080);
});

client.login(DISCORD_TOKEN);
