# GroupCord

> **An open-source, two-way bridge between Discord and GroupMe.**

GroupCord keeps Discord and GroupMe conversations synchronized with support for text, images, replies, usernames, avatars, and more.

---

## ✨ Features

- 🔄 Two-way message syncing
- 🖼️ Images in both directions
- 💬 Replies in both directions
- ✏️ Discord edit notifications
- 🗑️ Discord delete notifications
- 👤 Native GroupMe usernames in Discord
- 🖼️ Native GroupMe avatars in Discord
- 🌉 Multiple bridges
- ⚡ Automatic Discord webhook creation
- 📊 Bridge health monitoring
- 💾 SQLite database
- ☁️ Permanent cloud hosting with Northflank
- 🆓 Open Source (MIT)

---

# Quick Start (Recommended)

Estimated setup time:

**10–15 minutes**

Requirements:

- GitHub account
- Discord Bot
- GroupMe Bot
- GroupMe Access Token
- Northflank account

---

# 1. Clone the Repository

```bash
git clone https://github.com/camdaloon/GroupCord.git
cd GroupCord
```

---

# 2. Create a Discord Bot

1. Go to the Discord Developer Portal.
2. Create an application.
3. Create a Bot.
4. Enable:

- Message Content Intent

Invite the bot using the scopes:

- bot
- applications.commands

Permissions:

- View Channels
- Send Messages
- Read Message History
- Manage Webhooks

---

# 3. Create a GroupMe Bot

Visit:

https://dev.groupme.com/bots

Create a bot for your GroupMe group.

Save:

- Bot ID
- GroupMe Access Token

---

# 4. Deploy to Northflank

Create a new project.

Create a Service.

Connect your GitHub repository.

Use the default Buildpack deployment.

Runtime variables:

```env
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
CLIENT_ID=YOUR_APPLICATION_ID
GUILD_ID=YOUR_TEST_SERVER_ID

GROUPME_BOT_ID=YOUR_GROUPME_BOT_ID
GROUPME_ACCESS_TOKEN=YOUR_GROUPME_ACCESS_TOKEN

PORT=3000
```

Deploy.

When the logs show:

```text
🚀 GroupCord is online!
```

your bot is running.

---

# 5. Configure GroupMe

Set your callback URL to:

```
https://YOUR-NORTHFLANK-DOMAIN/webhook/groupme/YOUR_GROUPME_BOT_ID
```

Example:

```
https://groupcord-abc123.code.run/webhook/groupme/325cf6495ff62383cae340bec9
```

---

# 6. Invite the Discord Bot

Invite the bot to your server.

Run:

```
/setup
```

Choose:

- Discord channel
- GroupMe Bot ID

Done!

Your bridge is now live.

---

# Commands

| Command | Description |
|----------|-------------|
| `/setup` | Create or update a bridge |
| `/bridges` | List configured bridges |
| `/unlink` | Remove a bridge |
| `/status` | Check bridge health |
| `/ping` | Verify the bot is online |

---

# How It Works

```
Discord
     │
     ▼
 Discord Gateway
     │
 GroupCord
     │
 Express Web Server
     │
     ▼
 GroupMe Callback
```

Bridge settings are stored in SQLite.

---

# Current Features

## Discord → GroupMe

- Text
- Images
- Replies
- Edit notifications
- Delete notifications

## GroupMe → Discord

- Text
- Images
- Replies
- Usernames
- Avatars

---

# Local Development

Clone:

```bash
git clone https://github.com/camdaloon/GroupCord.git
```

Install:

```bash
npm install
```

Copy:

```bash
cp .env.example .env
```

Windows:

```cmd
copy .env.example .env
```

Run:

```bash
npm start
```

For local development, expose port 3000:

```bash
ngrok http 3000
```

Update the GroupMe callback URL to the ngrok URL.

---

# Environment Variables

```env
DISCORD_TOKEN=

CLIENT_ID=

GUILD_ID=

GROUPME_BOT_ID=

GROUPME_ACCESS_TOKEN=

PORT=3000
```

---

# Project Structure

```
GroupCord
│
├── src
│   ├── commands
│   ├── config
│   ├── database
│   ├── discord
│   ├── groupme
│   ├── util
│   ├── web
│   └── index.js
│
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── ROADMAP.md
├── README.md
├── package.json
└── .env.example
```

---

# Roadmap

Upcoming features include:

- 🌐 Web Dashboard
- 🐳 Docker Support
- 🗳️ Voting System
- 📁 Better File Support
- 😀 Improved Emoji Support
- ☁️ PostgreSQL
- 🔐 Discord OAuth
- 📈 Bridge Analytics
- 🚀 Public Hosted Version

See **ROADMAP.md** for the complete roadmap.

---

# Contributing

Contributions are welcome.

Please read:

```
CONTRIBUTING.md
```

before opening a Pull Request.

---

# License

GroupCord is licensed under the MIT License.

See:

```
LICENSE
```

---

# Screenshots

*(Coming Soon)*

- Dashboard
- Discord → GroupMe
- GroupMe → Discord
- Replies
- Images

---

# Built With

- Node.js
- discord.js
- Express
- better-sqlite3
- Axios
- Winston
- Northflank

---

Made by camdaloon