const { WebhookClient } = require("discord.js");

async function createWebhook(channel) {
    const webhook = await channel.createWebhook({
        name: "GroupCord",
    });

    return {
        id: webhook.id,
        token: webhook.token,
    };
}

function getWebhook(id, token) {
    return new WebhookClient({
        id,
        token,
    });
}

module.exports = {
    createWebhook,
    getWebhook,
};