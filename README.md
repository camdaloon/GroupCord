# GroupCord

> Bridge Discord and GroupMe with one bot.

GroupCord is an open-source bridge that keeps Discord and GroupMe synchronized.

It supports:

- 💬 Two-way messaging
- 🖼️ Images
- 💬 Replies
- ✏️ Message edit syncing
- 🗑️ Message delete syncing
- 👤 User avatars
- 🌉 Multiple bridges
- ☁️ 24/7 cloud hosting

---

# Invite GroupCord

The fastest way to get started is to invite the official GroupCord bot.

## ➜ Invite the Bot

https://discord.com/oauth2/authorize?client_id=1526746398870081636&permissions=536939520&integration_type=0&scope=bot+applications.commands

After inviting the bot, continue below.

---

# Getting Started

## Step 1

Invite GroupCord to your Discord server.

The bot requires:

- View Channels
- Send Messages
- Read Message History
- Manage Webhooks

---

## Step 2

Create a GroupMe Bot.

Go to:

https://dev.groupme.com/bots

Create a bot inside your GroupMe group.

Save your:

- Bot ID

---

## Step 3

Configure the bridge.

Inside Discord run:

```
/setup
```

Choose:

- Discord channel
- GroupMe Bot ID

That's it.

Your bridge is now live.

---

# Commands

| Command | Description |
|----------|-------------|
| `/setup` | Create or update a bridge |
| `/bridges` | View bridges |
| `/unlink` | Remove a bridge |
| `/status` | Check bridge health |
| `/ping` | Test the bot |

---

# Features

## Discord → GroupMe

✅ Text

✅ Images

✅ Replies

✅ Edit notifications

✅ Delete notifications

---

## GroupMe → Discord

✅ Text

✅ Images

✅ Replies

✅ User avatars

✅ Usernames

---

# Screenshots

Coming soon.

---

# Self Hosting

Want to host your own copy?

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

Start GroupCord:

```bash
npm start
```

---

# Roadmap

Upcoming features:

- 🌐 Web Dashboard
- 🐳 Docker Support
- 📊 Bridge Analytics
- 😀 Better Emoji Support
- 🗳️ Voting System
- 📁 Additional Attachment Support
- ☁️ PostgreSQL
- 🔐 Discord Login

See **ROADMAP.md** for more.

---

# Contributing

Pull requests are welcome.

See:

```
CONTRIBUTING.md
```

---

# License

MIT License

---

Made by camdaloon