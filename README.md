# GroupCord

<p align="center">

# 🌉 GroupCord

### A modern bridge between Discord and GroupMe.

Sync messages, images, replies, edits, and deletes between Discord and GroupMe.

[![Invite GroupCord](https://img.shields.io/badge/Invite-GroupCord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1526746398870081636&permissions=536939520&integration_type=0&scope=bot+applications.commands)

![GitHub stars](https://img.shields.io/github/stars/camdaloon/GroupCord?style=for-the-badge)

![GitHub last commit](https://img.shields.io/github/last-commit/camdaloon/GroupCord?style=for-the-badge)

![GitHub license](https://img.shields.io/github/license/camdaloon/GroupCord?style=for-the-badge)

</p>

---

# 🚀 Official GroupCord Bot

Don't want to host your own copy?

Simply invite the official GroupCord bot above.

---

# ⭐ Recommended Setup (Northflank)

Deploy your own copy of GroupCord in about **10 minutes**.

### Why Northflank?

- ✅ Free
- ✅ Always online
- ✅ No Node.js installation
- ✅ No ngrok
- ✅ No keeping your computer running
- ✅ Easy to update directly from GitHub

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

# 🚀 Deploy on Northflank

## Step 1 — Fork this Repository

Fork this repository to your own GitHub account.

---

## Step 2 — Create a GroupMe Bot

Visit:

https://dev.groupme.com/bots

Create a bot inside your GroupMe group.

Save:

- GroupMe Bot ID
- GroupMe Access Token

---

## Step 3 — Create a Northflank Account

Visit:

https://northflank.com

Sign in with GitHub.

---

## Step 4 — Create a Project

Click

**New Project**

Give it any name you like.

Example:

```
GroupCord
```

---

## Step 5 — Create a Service

Click

**Create Service**

Choose

**From Git Repository**

Select your fork.

Deployment Type:

**Buildpack**

---

## Step 6 — Configure Runtime Variables

Add these Runtime Variables:

```env
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN

CLIENT_ID=YOUR_DISCORD_APPLICATION_ID

GUILD_ID=YOUR_DISCORD_SERVER_ID

GROUPME_ACCESS_TOKEN=YOUR_GROUPME_ACCESS_TOKEN

GROUPME_BOT_ID=YOUR_GROUPME_BOT_ID

PORT=3000
```

---

## Step 7 — Configure Networking

Expose one public HTTP port:

```
3000
```

Leave all other settings as their defaults.

---

## Step 8 — Deploy

Click

**Create Service**

Wait until the logs show:

```
🚀 GroupCord is online!
```

---

## Step 9 — Copy Your Northflank URL

Northflank will generate a public URL similar to:

```
https://groupcord-xxxxx.code.run
```

Copy this URL.

---

## Step 10 — Configure Your GroupMe Callback

Return to

https://dev.groupme.com/bots

Edit your GroupMe bot.

Set the Callback URL to:

```
https://YOUR-NORTHFLANK-URL/webhook/groupme/YOUR_GROUPME_BOT_ID
```

Example:

```
https://groupcord-abc123.code.run/webhook/groupme/325cf6495ff62383cae340bec9
```

Save your changes.

---

## Step 11 — Create Your First Bridge

Invite the **official GroupCord bot** using the button at the top of this page (or your own bot if you're running a custom instance).

Inside Discord run:

```
/setup
```

Choose:

- Discord Channel
- GroupMe Bot ID

Press **Enter**.

That's it!

Your Discord server and GroupMe group are now connected.

---

# Commands

| Command | Description |
|----------|-------------|
| `/setup` | Create or update a bridge |
| `/bridges` | List all configured bridges |
| `/unlink` | Remove a bridge |
| `/status` | View bridge status |
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

Clone:

```bash
git clone https://github.com/camdaloon/GroupCord.git
```

Install:

```bash
npm install
```

Copy the environment file.

Windows

```cmd
copy .env.example .env
```

Linux/macOS

```bash
cp .env.example .env
```

Run:

```bash
npm start
```

If testing locally, expose port 3000:

```bash
ngrok http 3000
```

Update your GroupMe callback URL to the ngrok URL.

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

Contributions are welcome.

Please read:

```
CONTRIBUTING.md
```

before opening a Pull Request.

---

# License

MIT License

See

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