const express = require("express");

const config = require("../config/config");

const {
  getBridgeByGroupMeBotId,
  saveGroupMeMessage,
  getGroupMeMessage,
} = require("../database/database");

const { getWebhook } = require("../discord/webhooks");

function startWebServer(client) {
  const app = express();

  app.use(express.json());

  app.get("/", (request, response) => {
    response.send("GroupCord is online!");
  });

  app.post("/webhook/groupme/:botId", async (request, response) => {
    // Confirm receipt immediately.
    response.sendStatus(200);

    try {
      const groupMeMessage = request.body;
      const groupMeBotId = request.params.botId;

      // Ignore messages created by GroupMe bots to prevent loops.
      if (groupMeMessage.sender_type === "bot") {
        return;
      }

      const bridge = getBridgeByGroupMeBotId(groupMeBotId);

      if (!bridge) {
        console.warn(
          `[GroupMe] No bridge found for bot ID ${groupMeBotId}`
        );
        return;
      }

      const channel = await client.channels.fetch(
        bridge.channel_id
      );

      if (!channel || !channel.isTextBased()) {
        console.error(
          `[GroupMe] Discord channel ${bridge.channel_id} could not be found.`
        );
        return;
      }

      const attachments = Array.isArray(
        groupMeMessage.attachments
      )
        ? groupMeMessage.attachments
        : [];

      const replyAttachment = attachments.find(
        (attachment) => attachment.type === "reply"
      );

      const imageAttachments = attachments.filter(
        (attachment) =>
          attachment.type === "image" &&
          typeof attachment.url === "string"
      );

      const locationAttachments = attachments.filter(
        (attachment) => attachment.type === "location"
      );

      const otherAttachmentUrls = attachments
        .filter(
          (attachment) =>
            !["image", "location", "reply"].includes(
              attachment.type
            ) &&
            typeof attachment.url === "string"
        )
        .map((attachment) => attachment.url);

      const replyQuote = buildGroupMeReplyQuote(
        replyAttachment
      );

      const locationText = locationAttachments.map(
        (attachment) => {
          const name =
            attachment.name || "Shared location";

          const latitude = attachment.lat;
          const longitude = attachment.lng;

          if (latitude == null || longitude == null) {
            return `📍 ${name}`;
          }

          return (
            `📍 ${name}\n` +
            `https://www.google.com/maps?q=${latitude},${longitude}`
          );
        }
      );

      const messageContent = [
        replyQuote,
        groupMeMessage.text,
        ...locationText,
        ...otherAttachmentUrls,
      ]
        .filter(Boolean)
        .join("\n")
        .slice(0, 2000);

      const files = imageAttachments
        .slice(0, 10)
        .map((attachment, index) => ({
          attachment: attachment.url,
          name: getImageFilename(
            attachment.url,
            index
          ),
        }));

      if (!messageContent && files.length === 0) {
        console.warn(
          "[GroupMe] Received a message with no usable content."
        );
        return;
      }

      if (bridge.webhook_id && bridge.webhook_token) {
        try {
          const webhook = getWebhook(
            bridge.webhook_id,
            bridge.webhook_token
          );

          await webhook.send({
            content: messageContent || undefined,
            files,

            username: sanitizeWebhookUsername(
              groupMeMessage.name || "GroupMe User"
            ),

            avatarURL:
              groupMeMessage.avatar_url || undefined,

            allowedMentions: {
              parse: [],
            },
          });
        } catch (error) {
          console.error(
            "Saved Discord webhook failed. Falling back to bot:",
            error.message
          );

          await sendFallbackMessage(
            channel,
            groupMeMessage,
            messageContent,
            files
          );
        }
      } else {
        await sendFallbackMessage(
          channel,
          groupMeMessage,
          messageContent,
          files
        );
      }

      /*
       * Save this message after forwarding it.
       * Future replies can find it using reply_id.
       */
      saveGroupMeMessage({
        messageId: groupMeMessage.id,
        groupId: groupMeMessage.group_id,
        senderName:
          groupMeMessage.name || "GroupMe User",
        messageText:
          groupMeMessage.text ||
          (files.length > 0
            ? "[image attachment]"
            : "[message]"),
      });

      console.log(
        `[GroupMe → Discord] ` +
          `${groupMeMessage.name || "Unknown user"}: ` +
          `${
            groupMeMessage.text ||
            `[${files.length} attachment(s)]`
          }`
      );
    } catch (error) {
      console.error(
        "Failed to forward GroupMe message to Discord:",
        error
      );
    }
  });

  app.listen(config.server.port, () => {
    console.log(
      `🌐 Web server listening on port ${config.server.port}`
    );
  });
}

function buildGroupMeReplyQuote(replyAttachment) {
  if (!replyAttachment?.reply_id) {
    return "";
  }

  const originalMessage = getGroupMeMessage(
    replyAttachment.reply_id
  );

  if (!originalMessage) {
    return "↩️ Replying to an earlier GroupMe message:\n";
  }

  const preview = String(
    originalMessage.message_text || "[message]"
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return [
    `↩️ Replying to ${originalMessage.sender_name}:`,
    `> ${preview}`,
    "",
  ].join("\n");
}

async function sendFallbackMessage(
  channel,
  groupMeMessage,
  messageContent,
  files
) {
  await channel.send({
    content:
      `**${groupMeMessage.name || "GroupMe User"}**` +
      (messageContent ? `\n${messageContent}` : ""),

    files,

    allowedMentions: {
      parse: [],
    },
  });
}

function sanitizeWebhookUsername(name) {
  const cleanedName = String(name)
    .replace(/discord/gi, "GroupMe")
    .replace(/clyde/gi, "GroupMe")
    .trim();

  return cleanedName.slice(0, 80) || "GroupMe User";
}

function getImageFilename(url, index) {
  try {
    const parsedUrl = new URL(url);

    const extensionMatch = parsedUrl.pathname.match(
      /\.(png|jpe?g|gif|webp)$/i
    );

    const extension =
      extensionMatch?.[1]?.toLowerCase() || "jpg";

    return `groupme-image-${index + 1}.${extension}`;
  } catch {
    return `groupme-image-${index + 1}.jpg`;
  }
}

module.exports = startWebServer;