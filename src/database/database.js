const path = require("node:path");
const Database = require("better-sqlite3");

const databasePath = path.join(process.cwd(), "groupcord.sqlite");
const database = new Database(databasePath);

database.pragma("journal_mode = WAL");

database.exec(`
  CREATE TABLE IF NOT EXISTS bridges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    groupme_bot_id TEXT NOT NULL,
    webhook_id TEXT,
    webhook_token TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(guild_id, channel_id)
  );
`);

/*
 * Existing SQLite tables are not changed by
 * CREATE TABLE IF NOT EXISTS, so add newer columns here.
 */

database.exec(`
  CREATE TABLE IF NOT EXISTS groupme_messages (
    message_id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message_text TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function migrateDatabase() {
  const columns = database
    .prepare("PRAGMA table_info(bridges)")
    .all()
    .map((column) => column.name);

  if (!columns.includes("webhook_id")) {
    database.exec(`
      ALTER TABLE bridges
      ADD COLUMN webhook_id TEXT
    `);

    console.log("🗄️ Added webhook_id database column");
  }

  if (!columns.includes("webhook_token")) {
    database.exec(`
      ALTER TABLE bridges
      ADD COLUMN webhook_token TEXT
    `);

    console.log("🗄️ Added webhook_token database column");
  }
}

migrateDatabase();

function createBridge({
  guildId,
  channelId,
  groupMeBotId,
  webhookId,
  webhookToken,
  createdBy,
}) {
  const statement = database.prepare(`
    INSERT INTO bridges (
      guild_id,
      channel_id,
      groupme_bot_id,
      webhook_id,
      webhook_token,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?)

    ON CONFLICT(guild_id, channel_id)
    DO UPDATE SET
      groupme_bot_id = excluded.groupme_bot_id,
      webhook_id = excluded.webhook_id,
      webhook_token = excluded.webhook_token,
      created_by = excluded.created_by
  `);

  return statement.run(
    guildId,
    channelId,
    groupMeBotId,
    webhookId,
    webhookToken,
    createdBy
  );
}

function getBridgeByDiscordChannel(guildId, channelId) {
  return database
    .prepare(`
      SELECT *
      FROM bridges
      WHERE guild_id = ?
        AND channel_id = ?
    `)
    .get(guildId, channelId);
}

function getBridgeByGroupMeBotId(groupMeBotId) {
  return database
    .prepare(`
      SELECT *
      FROM bridges
      WHERE groupme_bot_id = ?
    `)
    .get(groupMeBotId);
}

function getBridgesForGuild(guildId) {
  return database
    .prepare(`
      SELECT *
      FROM bridges
      WHERE guild_id = ?
      ORDER BY created_at ASC
    `)
    .all(guildId);
}

function getAllBridges() {
  return database
    .prepare(`
      SELECT *
      FROM bridges
      ORDER BY guild_id, channel_id
    `)
    .all();
}

function updateWebhook(
  guildId,
  channelId,
  webhookId,
  webhookToken
) {
  return database
    .prepare(`
      UPDATE bridges
      SET webhook_id = ?,
          webhook_token = ?
      WHERE guild_id = ?
        AND channel_id = ?
    `)
    .run(
      webhookId,
      webhookToken,
      guildId,
      channelId
    );
}

function deleteBridge(guildId, channelId) {
  return database
    .prepare(`
      DELETE FROM bridges
      WHERE guild_id = ?
        AND channel_id = ?
    `)
    .run(guildId, channelId);
}

function saveGroupMeMessage({
  messageId,
  groupId,
  senderName,
  messageText,
}) {
  return database
    .prepare(`
      INSERT INTO groupme_messages (
        message_id,
        group_id,
        sender_name,
        message_text
      )
      VALUES (?, ?, ?, ?)

      ON CONFLICT(message_id)
      DO UPDATE SET
        sender_name = excluded.sender_name,
        message_text = excluded.message_text
    `)
    .run(
      messageId,
      groupId,
      senderName,
      messageText || null
    );
}

function getGroupMeMessage(messageId) {
  return database
    .prepare(`
      SELECT *
      FROM groupme_messages
      WHERE message_id = ?
    `)
    .get(messageId);
}


module.exports = {
  database,
  createBridge,
  getBridgeByDiscordChannel,
  getBridgeByGroupMeBotId,
  getBridgesForGuild,
  getAllBridges,
  updateWebhook,
  deleteBridge,
  saveGroupMeMessage,
  getGroupMeMessage,
};