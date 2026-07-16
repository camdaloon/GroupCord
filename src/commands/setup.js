const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

const { createBridge } = require("../database/database");
const { createWebhook } = require("../discord/webhooks");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Connect a Discord channel to a GroupMe bot.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The Discord channel to bridge.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("groupme-bot-id")
        .setDescription("The Bot ID from GroupMe.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel", true);
    const groupMeBotId = interaction.options.getString(
      "groupme-bot-id",
      true
    );

    // Create (or reuse) a Discord webhook for this channel
    const webhook = await createWebhook(channel);

    // Save bridge information
    createBridge({
      guildId: interaction.guildId,
      channelId: channel.id,
      groupMeBotId,
      webhookId: webhook.id,
      webhookToken: webhook.token,
      createdBy: interaction.user.id,
    });

    await interaction.reply({
      content:
        `✅ Bridge created!\n\n` +
        `**Discord Channel:** ${channel}\n` +
        `**GroupMe Bot ID:** \`${maskBotId(groupMeBotId)}\`\n` +
        `**Webhook:** \`${webhook.id}\``,
      ephemeral: true,
    });
  },
};

function maskBotId(botId) {
  if (botId.length <= 6) {
    return "••••••";
  }

  return `${botId.slice(0, 3)}••••${botId.slice(-3)}`;
}