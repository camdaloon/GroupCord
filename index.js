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
    // small delay helps GroupMe register message
    setTimeout(async () => {
      await fetch(`https://api.groupme.com/v3/messages/${messageId}/pin`, {
        method: "POST",
        headers: {
          "X-Access-Token": process.env.GROUPME_ACCESS_TOKEN
        }
      });
    }, 1500);
  } catch (err) {
    console.log("Pin failed (expected limitation in GroupMe API):", err.message);
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

  const groupmeRes = await fetch("https://api.groupme.com/v3/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bot_id: GROUPME_BOT_ID,
      text: msgText + "\n\nVote with:\n✅ or ❌"
    })
  });
  
  // BEST-EFFORT PINNING (GroupMe is inconsistent here)
  try {
    const data = await groupmeRes.json();

    // some environments return message_id differently
    const messageId =
      data?.response?.message_id ||
      data?.response?.id ||
      null;
  
    if (messageId) {
      latestGroupMeMessageId = messageId;
      await pinLatestGroupMeMessage(messageId);
    }
  } catch (err) {
    console.log("GroupMe pin parse failed:", err.message);
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

  const voterId = user.id;
  const emoji = reaction.emoji.name;

  const bill = votes[billId];
  if (!bill) return;

  const reactions = reaction.message.reactions.cache;

  // REMOVE opposite reaction FIRST (important fix)
  try {
    if (emoji === "✅") {
      const opposite = reactions.get("❌");
      if (opposite) {
        const users = await opposite.users.fetch();
        if (users.has(voterId)) await opposite.users.remove(voterId);
      }
    }

    if (emoji === "❌") {
      const opposite = reactions.get("✅");
      if (opposite) {
        const users = await opposite.users.fetch();
        if (users.has(voterId)) await opposite.users.remove(voterId);
      }
    }
  } catch (err) {
    console.log("Reaction cleanup error:", err);
  }

  // FIX vote tracking
  const voter = user.username;

  const prev = bill.voters.get(voter);
  if (prev === "yes") bill.yes.delete(voter);
  if (prev === "no") bill.no.delete(voter);

  if (emoji === "✅") {
    bill.yes.add(voter);
    bill.voters.set(voter, "yes");
  }

  if (emoji === "❌") {
    bill.no.add(voter);
    bill.voters.set(voter, "no");
  }

  const yesCount = bill.yes.size;
  const noCount = bill.no.size;

  sendToAllChannels(`📊 ${billId}\n✅ ${yesCount} | ❌ ${noCount}`);

  checkBillEnd(billId);
});

// ===============================
app.listen(process.env.PORT || 8080, () => {
  console.log("Bot running on port", process.env.PORT || 8080);
});

client.login(DISCORD_TOKEN);
