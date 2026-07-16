const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require("discord.js");

const {
    deleteBridge,
} = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Remove a bridge.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        )
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Discord channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel =
            interaction.options.getChannel("channel");

        const result = deleteBridge(
            interaction.guild.id,
            channel.id
        );

        if (result.changes === 0) {

            return interaction.reply({
                content:
                    "❌ That channel is not currently bridged.",
                ephemeral: true,
            });

        }

        await interaction.reply({

            content:
`✅ Bridge removed!

${channel}

is no longer connected to GroupMe.`,

            ephemeral: true,

        });

    },

};