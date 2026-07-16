require("dotenv").config();

const requiredVariables = [
  "DISCORD_TOKEN",
  "CLIENT_ID",
  "GUILD_ID",
  "GROUPME_BOT_ID",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
}

module.exports = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
  },

  groupme: {
    botId: process.env.GROUPME_BOT_ID,
    accessToken: process.env.GROUPME_ACCESS_TOKEN,
  },

  server: {
    port: Number(process.env.PORT) || 3000,
  },
};