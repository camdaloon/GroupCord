const axios = require("axios");
const config = require("../config/config");

const GROUPME_BOT_POST_URL = "https://api.groupme.com/v3/bots/post";

async function sendGroupMeMessage(text) {
  const cleanText = text?.trim();

  if (!cleanText) {
    return;
  }

  await axios.post(GROUPME_BOT_POST_URL, {
    bot_id: config.groupme.botId,
    text: cleanText.slice(0, 1000),
  });
}

module.exports = sendGroupMeMessage;