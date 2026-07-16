const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");

const {
    getAllBridges,
} = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("bridges")
        .setDescription("View every configured bridge."),

    async execute(interaction) {

        const bridges = getAllBridges();

        if (bridges.length === 0) {

            return interaction.reply({
                content: "No bridges have been configured.",
                ephemeral: true,
            });

        }

        const embed = new EmbedBuilder()
            .setTitle("🌉 Configured Bridges")
            .setColor(0x5865F2);

        for (const bridge of bridges) {

            embed.addFields({
                name: `<#${bridge.channel_id}>`,
                value:
`Guild ID: \`${bridge.guild_id}\`
GroupMe Bot:
\`${bridge.groupme_bot_id.slice(0,4)}••••${bridge.groupme_bot_id.slice(-4)}\``,
            });

        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });

    },

};