const axios = require("axios");

const {
  getBridgeByDiscordChannel,
} = require("../../database/database");

const uploadImageToGroupMe = require(
  "../../groupme/uploadImage"
);

const GROUPME_BOT_POST_URL =
  "https://api.groupme.com/v3/bots/post";

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    // Ignore bots/webhooks and direct messages.
    if (message.author.bot || !message.guild) {
      return;
    }

    const bridge = getBridgeByDiscordChannel(
      message.guild.id,
      message.channel.id
    );

    // Ignore Discord channels that are not connected.
    if (!bridge) {
      return;
    }

    try {
      const attachments = [
        ...message.attachments.values(),
      ];

      const imageAttachments = attachments.filter(
        (attachment) =>
          attachment.contentType?.startsWith("image/")
      );

      const otherAttachments = attachments.filter(
        (attachment) =>
          !attachment.contentType?.startsWith("image/")
      );

      const uploadedImages = [];

      // GroupMe bot posts reliably support one uploaded image.
      for (const attachment of imageAttachments.slice(0, 1)) {
        try {
          const groupMeImageUrl =
            await uploadImageToGroupMe(
              attachment.url,
              attachment.contentType
            );

          uploadedImages.push({
            type: "image",
            url: groupMeImageUrl,
          });
        } catch (error) {
          console.error(
            `Failed to upload Discord image "${attachment.name}" to GroupMe:`,
            error.response?.data || error.message
          );
        }
      }

      const extraUrls = [
        // Additional images are forwarded as links.
        ...imageAttachments
          .slice(1)
          .map((attachment) => attachment.url),

        // Other files are forwarded as links.
        ...otherAttachments.map(
          (attachment) => attachment.url
        ),
      ];

      const replyQuote = await buildReplyQuote(message);

      const displayName =
        message.member?.displayName ||
        message.author.displayName ||
        message.author.username;

      const convertedContent = convertCustomEmojis(
        message.content
      );

      const forwardedText = [
        `💬 ${displayName}`,
        `#${message.channel.name}`,
        "",
        replyQuote,
        convertedContent,
        ...extraUrls,
      ]
        .filter(
          (part) =>
            part !== undefined &&
            part !== null &&
            part !== ""
        )
        .join("\n")
        .trim()
        .slice(0, 1000);

      if (!forwardedText && uploadedImages.length === 0) {
        return;
      }

      await axios.post(GROUPME_BOT_POST_URL, {
        bot_id: bridge.groupme_bot_id,
        text: forwardedText || "Image from Discord",
        attachments: uploadedImages,
      });

      console.log(
        `[Discord → GroupMe] #${message.channel.name} | ` +
          `${message.author.username}: ` +
          `${
            message.content ||
            `[${attachments.length} attachment(s)]`
          }`
      );
    } catch (error) {
      console.error(
        "Failed to forward Discord message to GroupMe:",
        error.response?.data || error.message
      );
    }
  });
};

/**
 * Builds a readable quote when the Discord message is a reply.
 */
async function buildReplyQuote(message) {
  if (!message.reference?.messageId) {
    return "";
  }

  try {
    const referencedMessage =
      await message.fetchReference();

    const referencedAuthor =
      referencedMessage.member?.displayName ||
      referencedMessage.author?.displayName ||
      referencedMessage.author?.username ||
      "Unknown user";

    let referencedContent = convertCustomEmojis(
      referencedMessage.content || ""
    );

    if (!referencedContent) {
      if (referencedMessage.attachments.size > 0) {
        referencedContent = "[attachment]";
      } else {
        referencedContent = "[message]";
      }
    }

    // Keep quotes short so the new message still fits GroupMe.
    referencedContent = referencedContent
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);

    return [
      `↩️ Replying to ${referencedAuthor}:`,
      `> ${referencedContent}`,
      "",
    ].join("\n");
  } catch (error) {
    console.warn(
      "Could not load the replied-to Discord message:",
      error.message
    );

    return "↩️ Replying to an earlier message:\n";
  }
}

/**
 * Converts Discord custom emoji markup into usable image links.
 *
 * <:name:id>
 * <a:name:id>
 */
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