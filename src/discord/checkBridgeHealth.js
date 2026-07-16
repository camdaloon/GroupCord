const {
  PermissionFlagsBits,
} = require("discord.js");

const {
  getAllBridges,
} = require("../database/database");

async function checkBridgeHealth(client) {
  const bridges = getAllBridges();

  if (bridges.length === 0) {
    console.log("ℹ️ No bridges configured");
    return;
  }

  console.log("");
  console.log("Bridge Health");
  console.log("────────────────────────");

  for (const bridge of bridges) {
    try {
      const channel = await client.channels.fetch(
        bridge.channel_id
      );

      if (!channel || !channel.isTextBased()) {
        console.log(
          `❌ Channel ${bridge.channel_id} could not be found`
        );
        continue;
      }

      const botMember = channel.guild.members.me;

      if (!botMember) {
        console.log(
          `❌ #${channel.name}: bot member unavailable`
        );
        continue;
      }

      const permissions = channel.permissionsFor(botMember);

      const requiredPermissions = [
        {
          permission: PermissionFlagsBits.ViewChannel,
          name: "View Channel",
        },
        {
          permission: PermissionFlagsBits.SendMessages,
          name: "Send Messages",
        },
        {
          permission: PermissionFlagsBits.ReadMessageHistory,
          name: "Read Message History",
        },
        {
          permission: PermissionFlagsBits.ManageWebhooks,
          name: "Manage Webhooks",
        },
      ];

      const missingPermissions = requiredPermissions
        .filter(
          ({ permission }) =>
            !permissions?.has(permission)
        )
        .map(({ name }) => name);

      if (missingPermissions.length === 0) {
        console.log(`✅ #${channel.name}`);
      } else {
        console.log(`⚠️ #${channel.name}`);
        console.log(
          `   Missing: ${missingPermissions.join(", ")}`
        );
      }

      if (!bridge.webhook_id || !bridge.webhook_token) {
        console.log("   Missing: saved webhook");
      }
    } catch (error) {
      console.log(
        `❌ Bridge ${bridge.id}: ${error.message}`
      );
    }
  }

  console.log("────────────────────────");
  console.log("");
}

module.exports = checkBridgeHealth;