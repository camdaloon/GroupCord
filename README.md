# 🌉 GroupCord

<p align="center">

### A modern bridge between Discord and GroupMe.

Sync messages, images, replies, edits, and deletes between Discord and GroupMe.

[![Invite GroupCord](https://img.shields.io/badge/Invite-GroupCord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1526746398870081636&permissions=536939520&integration_type=0&scope=bot+applications.commands)

![GitHub stars](https://img.shields.io/github/stars/camdaloon/GroupCord?style=for-the-badge)

![GitHub last commit](https://img.shields.io/github/last-commit/camdaloon/GroupCord?style=for-the-badge)

![GitHub license](https://img.shields.io/github/license/camdaloon/GroupCord?style=for-the-badge)

</p>

---

# 🚀 Official GroupCord Bot

Want to use GroupCord without creating your own Discord bot?

Click the **Invite GroupCord** button above.

> 💡 **Tip:** Right-click the **Invite GroupCord** button and choose **"Open Link in New Tab"** so you can continue following this guide while inviting the bot.

---

# ✨ Features

## Discord → GroupMe

- ✅ Messages
- ✅ Images
- ✅ Replies
- ✅ Edit Notifications
- ✅ Delete Notifications

## GroupMe → Discord

- ✅ Messages
- ✅ Images
- ✅ Replies
- ✅ Usernames
- ✅ User Avatars

## General

- 🌉 Multiple Bridges
- ⚡ Automatic Discord Webhooks
- ☁️ Cloud Hosted
- 💾 SQLite Database
- 🚀 Fast Setup
- 🆓 Open Source

---

# 🚀 Getting Started

Deploy your own GroupCord backend in about **10 minutes** using **Northflank**.

### Why Northflank?

- ✅ Free
- ✅ Always online
- ✅ No Node.js installation
- ✅ No ngrok
- ✅ No keeping your computer running
- ✅ Easy updates from GitHub

---

## Step 1 — Invite the Official GroupCord Bot

Click the button at the top of this page to invite the official GroupCord bot to your Discord server.

> 💡 **Tip:** Right-click the **Invite GroupCord** button and choose **"Open Link in New Tab"** so you can continue reading this guide while inviting the bot.

---

## Step 2 — Create a GroupMe Bot

Visit:

https://dev.groupme.com/bots

Create a bot inside your GroupMe group.

Save your:

- GroupMe Bot ID
- GroupMe Access Token

---

## Step 3 — Deploy on Northflank

Visit:

https://northflank.com

Sign in with GitHub.

Create a new project.

Create a new service.

Choose:

**From Git Repository**

Select your fork of GroupCord.

Deployment Type:

**Buildpack**

---

## Step 4 — Configure Runtime Variables

Add the following Runtime Variables:

```env
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN

CLIENT_ID=YOUR_DISCORD_APPLICATION_ID

GUILD_ID=YOUR_DISCORD_SERVER_ID

GROUPME_ACCESS_TOKEN=YOUR_GROUPME_ACCESS_TOKEN

GROUPME_BOT_ID=YOUR_GROUPME_BOT_ID

PORT=3000
```

Click **Create Service**.

Wait until the logs display:

```
🚀 GroupCord is online!
```

---

## Step 5 — Configure Your GroupMe Callback

Northflank will generate a public URL similar to:

```
https://groupcord-xxxxx.code.run
```

Copy that URL.

Return to:

https://dev.groupme.com/bots

Edit your GroupMe Bot.

Set the Callback URL to:

```
https://YOUR-NORTHFLANK-URL/webhook/groupme/YOUR_GROUPME_BOT_ID
```

Example:

```
https://groupcord-abc123.code.run/webhook/groupme/325cf6495ff62383cae340bec9
```

Save the changes.

---

## Step 6 — Create Your First Bridge

Inside Discord, run:

```
/setup
```

Choose:

- Discord Channel
- GroupMe Bot ID

Press **Enter**.

🎉 Your Discord server and GroupMe group are now connected!

---

## ✅ Verify Everything Works

Send a message in Discord.

It should appear in GroupMe.

Send a message in GroupMe.

It should appear in Discord.

If both tests succeed, your bridge is fully operational.

---

# Commands

| Command | Description |
|----------|-------------|
| `/setup` | Create or update a bridge |
| `/bridges` | View all configured bridges |
| `/unlink` | Remove a bridge |
| `/status` | Check bridge status |
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

---

# Local Development

This section is intended for developers contributing to GroupCord.

Clone the repository:

```bash
git clone https://github.com/camdaloon/GroupCord.git
```

Install dependencies:

```bash
npm install
```

Copy the environment file.

Windows:

```cmd
copy .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Run GroupCord:

```bash
npm start
```

If testing locally, expose port 3000 using ngrok:

```bash
ngrok http 3000
```

Update the GroupMe callback URL to the ngrok URL.

---

# Roadmap

Upcoming features:

- 🌐 Web Dashboard
- 🐳 Docker Support
- 📈 Bridge Analytics
- 😀 Better Emoji Support
- 📁 Additional File Support
- ☁️ PostgreSQL
- 🔐 Discord OAuth
- 🗳️ Voting System

See **ROADMAP.md** for the complete roadmap.

---

# Contributing

Contributions are always welcome.

Please read:

```
CONTRIBUTING.md
```

before opening a Pull Request.

---

# License

MIT License

See:

```
LICENSE
```

---

# Screenshots

Coming Soon

- Discord → GroupMe
- GroupMe → Discord
- Images
- Replies
- Web Dashboard

---

<p align="center">

Made by camdaloon

</p>