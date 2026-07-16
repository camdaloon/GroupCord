const { REST, Routes } = require("discord.js");

const config = require("../config/config");
const setupCommand = require("../commands/setup");
const pingCommand = require("../commands/ping");
const bridgesCommand = require("../commands/bridges");
const unlinkCommand = require("../commands/unlink");
const statusCommand = require("../commands/status");

const commands = [
  pingCommand.data.toJSON(),
  setupCommand.data.toJSON(),
  bridgesCommand.data.toJSON(),
  unlinkCommand.data.toJSON(),
  statusCommand.data.toJSON(),
];

async function deployCommands() {
  const rest = new REST({ version: "10" }).setToken(
    config.discord.token
  );

  console.log("🔄 Registering Discord commands...");

  await rest.put(
    Routes.applicationGuildCommands(
      config.discord.clientId,
      config.discord.guildId
    ),
    { body: commands }
  );

  console.log("✅ Discord commands registered");
}

module.exports = deployCommands;