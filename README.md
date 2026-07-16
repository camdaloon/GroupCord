# GroupCord

<p align="center">
  <h3 align="center">Bridge Discord and GroupMe in minutes.</h3>

  <p align="center">
    Two-way synchronization between Discord and GroupMe with support for text, images, replies, edits, deletes, webhooks, and multiple bridges.
  </p>
</p>

---

## 🚀 Invite the Official GroupCord Bot

If you'd rather not host your own copy, you can invite the official GroupCord bot.

<p align="center">

[![Invite GroupCord](https://img.shields.io/badge/Invite-GroupCord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1526746398870081636&permissions=536939520&integration_type=0&scope=bot+applications.commands)

</p>

---

# ⭐ Recommended: Deploy Your Own GroupCord (Free)

The easiest way to use GroupCord is by deploying your own copy using **Northflank**.

✅ Free

✅ Always online

✅ No Node.js installation

✅ No ngrok

✅ No keeping your computer on

⏱️ Average setup time: **10–15 minutes**

---

# ✨ Features

## Discord → GroupMe

- ✅ Text Messages
- ✅ Images
- ✅ Replies
- ✅ Edit Notifications
- ✅ Delete Notifications

## GroupMe → Discord

- ✅ Text Messages
- ✅ Images
- ✅ Replies
- ✅ User Avatars
- ✅ Usernames

## General

- 🌉 Multiple Bridges
- ⚡ Automatic Discord Webhooks
- 💾 SQLite Database
- ☁️ 24/7 Cloud Hosting
- 🆓 Open Source

---

# 🚀 Northflank Setup Guide

## Step 1 — Fork this Repository

Fork GroupCord to your GitHub account.

Or clone it if you prefer.

---

## Step 2 — Create a Discord Bot

Open the Discord Developer Portal.

Create a new Application.

Open the **Bot** page.

Enable:

- Message Content Intent

Copy:

- Bot Token
- Client ID

Next, open **OAuth2 → URL Generator**.

Select:

Scopes

- bot
- applications.commands

Permissions

- View Channels
- Send Messages
- Read Message History
- Manage Webhooks

Copy the generated invite URL.

---

## Step 3 — Create a GroupMe Bot

Visit:

https://dev.groupme.com/bots

Create a bot inside your GroupMe group.

Save:

- GroupMe Bot ID
- GroupMe Access Token

---

## Step 4 — Create a Northflank Account

https://northflank.com

Sign in with GitHub.

---

## Step 5 — Create a Project

Click

**New Project**

Name it:

```
GroupCord
```

---

## Step 6 — Create a Service

Click

**Create Service**

Choose

**From Git Repository**

Select your GitHub fork.

Deployment Type:

**Buildpack**

---

## Step 7 — Runtime Variables

Add the following Runtime Variables:

```env
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN

CLIENT_ID=YOUR_DISCORD_CLIENT_ID

GUILD_ID=YOUR_TEST_SERVER_ID

GROUPME_ACCESS_TOKEN=YOUR_GROUPME_ACCESS_TOKEN

GROUPME_BOT_ID=YOUR_GROUPME_BOT_ID

PORT=3000
```

---

## Step 8 — Networking

Expose one HTTP port:

```
3000
```

Leave everything else as the default.

---

## Step 9 — Deploy

Click

**Create Service**

Wait until the logs show:

```
🚀 GroupCord is online!
```

---

## Step 10 — Copy Your Northflank URL

Northflank will generate a public URL similar to:

```
https://groupcord-xxxxx.code.run
```

Copy it.

---

## Step 11 — Configure the GroupMe Callback

Return to

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

## Step 12 — Invite Your Discord Bot

Use the invite URL you generated earlier.

Invite the bot to your Discord server.

---

## Step 13 — Create Your Bridge

Run

```
/setup
```

Choose

- Discord Channel
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
| `/status` | View bridge status |
| `/ping` | Verify the bot is online |

---

# How GroupCord Works

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
GroupMe Webhook
```

---

# Local Development

This section is only for developers contributing to GroupCord.

Clone the repository:

```bash
git clone https://github.com/camdaloon/GroupCord.git
```

Install dependencies:

```bash
npm install
```

Copy the environment file:

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

Expose port 3000 with ngrok:

```bash
ngrok http 3000
```

Update your GroupMe callback URL to the ngrok URL.

---

# Roadmap

Upcoming features:

- 🌐 Web Dashboard
- 🐳 Docker Support
- 📈 Analytics
- 😀 Better Emoji Support
- 📁 Additional File Support
- 🗳️ Voting System
- ☁️ PostgreSQL
- 🔐 Discord OAuth

See **ROADMAP.md** for more information.

---

# Contributing

Contributions are welcome.

Please read:

```
CONTRIBUTING.md
```

before submitting a Pull Request.

---

# License

MIT License

See:

```
LICENSE
```

---

# Screenshots

Coming soon.

- Discord → GroupMe
- GroupMe → Discord
- Images
- Replies
- Dashboard

---

<p align="center">

Made by camdaloon

</p>