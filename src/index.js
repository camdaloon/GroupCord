const client = require("./discord/client");
const config = require("./config/config");

client.once("clientReady", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(config.discord.token);