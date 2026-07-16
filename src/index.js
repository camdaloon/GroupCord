const client = require("./discord/client");
const config = require("./config/config");
const deployCommands = require("./discord/deployCommand");
const startWebServer = require("./web/server");
const checkBridgeHealth = require(
  "./discord/checkBridgeHealth"
);

require("./database/database");

require("./discord/events/messageCreate")(client);
require("./discord/events/messageUpdate")(client);
require("./discord/events/messageDelete")(client);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const commands = {
    ping: require("./commands/ping"),
    setup: require("./commands/setup"),
    bridges: require("./commands/bridges"),
    unlink: require("./commands/unlink"),
    status: require("./commands/status"),
  };

  const command = commands[interaction.commandName];

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Command /${interaction.commandName} failed:`, error);

    let message = "❌ Something went wrong while running that command.";

    // Discord permission error
    if (error.code === 50013) {
      message =
        "❌ **Missing Permissions**\n\n" +
        "GroupCord needs the **Manage Webhooks** permission in this channel.\n\n" +
        "**To fix it:**\n" +
        "• Give the GroupCord role the **Manage Webhooks** permission\n" +
        "• Or re-invite the bot with the **Manage Webhooks** permission enabled";
    }

    // Missing access
    else if (error.code === 50001) {
      message =
        "❌ GroupCord cannot access that channel.\n\n" +
        "Make sure it can view the channel and send messages.";
    }

    const response = {
      content: message,
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response);
    } else {
      await interaction.reply(response);
    }
  }
});

client.once("clientReady", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log("🗄️ Database initialized");
  console.log("🌐 Web server running");
  console.log("🚀 GroupCord is online!");

  await checkBridgeHealth(client);
});
async function start() {
  try {
    await deployCommands();
    startWebServer(client);
    await client.login(config.discord.token);
  } catch (error) {
    console.error("Failed to start GroupCord:", error);
    process.exit(1);
  }
}

start();