# GroupCord

<p align="center">
  <h1 align="center">GroupCord</h1>

  <p align="center">
    A modern bridge between Discord and GroupMe.
    <br>
    Sync messages, images, replies, edits, and deletes in both directions.
  </p>
</p>

---

## 🚀 Invite the Official GroupCord Bot

Want to try GroupCord without hosting your own copy?

<p align="center">

[![Invite GroupCord](https://img.shields.io/badge/Invite-GroupCord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1526746398870081636&permissions=536939520&integration_type=0&scope=bot+applications.commands)

</p>

> **Tip:** Right-click the button and choose **"Open Link in New Tab"** if you want to keep this page open while setting everything up.

---

# ✨ Features

## Discord → GroupMe

- ✅ Messages
- ✅ Images
- ✅ Replies
- ✅ Edit notifications
- ✅ Delete notifications

## GroupMe → Discord

- ✅ Messages
- ✅ Images
- ✅ Replies
- ✅ User avatars
- ✅ Usernames

## General

- 🌉 Multiple bridges
- ⚡ Automatic Discord webhooks
- 💾 SQLite database
- ☁️ Cloud hosted
- 🚀 Fast setup
- 🆓 Open Source

---

# ⭐ Recommended Setup (Northflank)

The easiest way to use GroupCord is by deploying your own copy to **Northflank**.

### Benefits

- ✅ Free
- ✅ Always online
- ✅ No Node.js installation
- ✅ No ngrok
- ✅ No keeping your computer on
- ✅ Deploys in about 10 minutes

---

# Step 1 — Fork this Repository

Fork this repository to your own GitHub account.

---

# Step 2 — Create a GroupMe Bot

Go to:

https://dev.groupme.com/bots

Create a bot inside your GroupMe group.

Save your:

- GroupMe Bot ID
- GroupMe Access Token

---

# Step 3 — Create a Northflank Account

Visit:

https://northflank.com

Sign in using GitHub.

---

# Step 4 — Create a Project

Click

**New Project**

Name it anything you'd like.

Example:

```
GroupCord
```

---

# Step 5 — Create a Service

Inside your project:

Click

**Create Service**

Choose

**From Git Repository**

Select your fork of GroupCord.

Deployment Type:

**Buildpack**

---

# Step 6 — Configure Runtime Variables

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

# Step 7 — Configure Networking

Expose one public HTTP port:

```
3000
```

Leave all other settings as their defaults.

---

# Step 8 — Deploy

Click

**Create Service**

Wait until the logs say:

```
🚀 GroupCord is online!
```

---

# Step 9 — Copy Your Northflank URL

Northflank will generate a URL similar to:

```
https://groupcord-xxxxx.code.run
```

Copy this URL.

---

# Step 10 — Configure the GroupMe Callback

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

Save your changes.

---

# Step 11 — Invite Your Bot

Invite your Discord bot to your server.

Or use the official hosted GroupCord bot above.

---

# Step 12 — Create Your First Bridge

Run:

```
/setup
```

Select:

- Discord Channel
- GroupMe Bot ID

That's it!

Your Discord server and GroupMe group are now connected.

---

# Commands

| Command | Description |
|----------|-------------|
| `/setup` | Create or update a bridge |
| `/bridges` | List all bridges |
| `/unlink` | Remove a bridge |
| `/status` | View bridge status |
| `/ping` | Test if the bot is online |

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
└── package.json
```

---

# Local Development

Only needed if you want to contribute to GroupCord.

Clone the repository:

```bash
git clone https://github.com/camdaloon/GroupCord.git
```

Install dependencies:

```bash
npm install
```

Copy the environment file:

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

If testing locally, expose port 3000 with ngrok:

```bash
ngrok http 3000
```

Then update your GroupMe callback URL.

---

# Roadmap

Upcoming features:

- 🌐 Web Dashboard
- 🐳 Docker Support
- 📈 Bridge Analytics
- 😀 Better Emoji Support
- 📁 Additional Attachment Support
- ☁️ PostgreSQL
- 🔐 Discord OAuth
- 🗳️ Voting System

See **ROADMAP.md** for the full roadmap.

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
- Replies
- Images
- Web Dashboard

---

<p align="center">

Made by camdaloon

</p>