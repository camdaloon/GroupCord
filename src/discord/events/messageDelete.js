const axios = require("axios");

const {
  getBridgeByDiscordChannel,
} = require("../../database/database");

const GROUPME_BOT_POST_URL =
  "https://api.groupme.com/v3/bots/post";

module.exports = (client) => {
  client.on("messageDelete", async (message) => {
    try {
      if (!message.guild) {
        return;
      }

      // Ignore messages created by bots or Discord webhooks.
      if (message.author?.bot || message.webhookId) {
        return;
      }

      const bridge = getBridgeByDiscordChannel(
        message.guild.id,
        message.channel.id
      );

      if (!bridge) {
        return;
      }

      const displayName =
        message.member?.displayName ||
        message.author?.displayName ||
        message.author?.username ||
        "A Discord user";

      const oldPreview = message.content
        ? convertCustomEmojis(message.content)
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 250)
        : "";

      const notice = [
        `🗑️ ${displayName} deleted a Discord message`,
        `#${message.channel.name}`,
        oldPreview ? "" : null,
        oldPreview ? `Previous text: ${oldPreview}` : null,
      ]
        .filter((part) => part !== null)
        .join("\n")
        .slice(0, 1000);

      await axios.post(GROUPME_BOT_POST_URL, {
        bot_id: bridge.groupme_bot_id,
        text: notice,
      });

      console.log(
        `[Discord deletion → GroupMe] #${message.channel.name} | ${displayName}`
      );
    } catch (error) {
      console.error(
        "Failed to forward Discord deletion to GroupMe:",
        error.response?.data || error.message
      );
    }
  });
};

function convertCustomEmojis(text = "") {
  return text.replace(
    /<(a?):([a-zA-Z0-9_]+):(\d+)>/g,
    (match, animated, name, id) => {
      const extension = animated ? "gif" : "png";

      return (
        `:${name}: ` +
        `https://cdn.discordapp.com/emojis/${id}.${extension}`
      );
    }
  );
}