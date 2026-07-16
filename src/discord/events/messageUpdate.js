const axios = require("axios");

const {
  getBridgeByDiscordChannel,
} = require("../../database/database");

const GROUPME_BOT_POST_URL =
  "https://api.groupme.com/v3/bots/post";

module.exports = (client) => {
  client.on("messageUpdate", async (oldMessage, newMessage) => {
    try {
      // Load the complete updated message when Discord supplied a partial.
      if (newMessage.partial) {
        newMessage = await newMessage.fetch();
      }

      if (
        !newMessage.guild ||
        newMessage.author?.bot ||
        newMessage.webhookId
      ) {
        return;
      }

      const bridge = getBridgeByDiscordChannel(
        newMessage.guild.id,
        newMessage.channel.id
      );

      if (!bridge) {
        return;
      }

      const oldContent = oldMessage.content || "";
      const newContent = newMessage.content || "";

      // Discord can emit messageUpdate for embed/link-preview changes.
      // Ignore it when the actual text did not change.
      if (oldContent === newContent) {
        return;
      }

      const displayName =
        newMessage.member?.displayName ||
        newMessage.author?.displayName ||
        newMessage.author?.username ||
        "Discord user";

      const convertedContent = convertCustomEmojis(newContent);

      const notice = [
        `✏️ ${displayName} edited a Discord message`,
        `#${newMessage.channel.name}`,
        "",
        convertedContent || "[message now contains no text]",
      ]
        .join("\n")
        .slice(0, 1000);

      await axios.post(GROUPME_BOT_POST_URL, {
        bot_id: bridge.groupme_bot_id,
        text: notice,
      });

      console.log(
        `[Discord edit → GroupMe] #${newMessage.channel.name} | ${displayName}`
      );
    } catch (error) {
      console.error(
        "Failed to forward Discord edit to GroupMe:",
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