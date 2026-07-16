const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const {
  getBridgesForGuild,
} = require("../database/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check GroupCord's status for this server."),

  async execute(interaction) {
    const bridges = getBridgesForGuild(interaction.guildId);

    const healthyBridges = bridges.filter(
      (bridge) =>
        bridge.channel_id &&
        bridge.groupme_bot_id &&
        bridge.webhook_id &&
        bridge.webhook_token
    );

    const embed = new EmbedBuilder()
      .setTitle("GroupCord Status")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "Discord",
          value: interaction.client.isReady()
            ? "✅ Connected"
            : "❌ Disconnected",
          inline: true,
        },
        {
          name: "Database",
          value: "✅ Connected",
          inline: true,
        },
        {
          name: "Web Server",
          value: "✅ Running",
          inline: true,
        },
        {
          name: "Configured Bridges",
          value: String(bridges.length),
          inline: true,
        },
        {
          name: "Healthy Bridges",
          value: String(healthyBridges.length),
          inline: true,
        }
      )
      .setFooter({
        text: "GroupCord v0.3.0",
      })
      .setTimestamp();

    if (bridges.length === 0) {
      embed.setDescription(
        "No bridges are configured for this Discord server. Run `/setup` to create one."
      );
    } else if (healthyBridges.length === bridges.length) {
      embed.setDescription(
        "All configured bridges appear healthy."
      );
    } else {
      embed.setDescription(
        "One or more bridges may be missing webhook information. Run `/setup` again for the affected channel."
      );
    }

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};