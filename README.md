# GroupCord

**GroupCord** is an open-source, two-way bridge between Discord and GroupMe.

Messages, images, replies, usernames, and profile pictures can be synchronized between a Discord channel and a GroupMe group.

> Current version: **v0.3.0**

## Features

- Discord → GroupMe message forwarding
- GroupMe → Discord message forwarding
- Images in both directions
- Replies in both directions
- Discord edit notices in GroupMe
- Discord deletion notices in GroupMe
- Native GroupMe usernames and profile pictures in Discord
- Standard Unicode emoji support
- Discord custom emoji links
- Multiple Discord servers and channels
- SQLite bridge configuration
- Automatic Discord webhook creation
- Bridge health checks
- Slash-command configuration
- Loop prevention

## Commands

| Command | Description |
|---|---|
| `/setup` | Connect a Discord channel to a GroupMe bot |
| `/bridges` | List configured bridges |
| `/unlink` | Remove a bridge |
| `/status` | Check GroupCord and bridge health |
| `/ping` | Check whether the bot is online |

Administrative commands require the **Manage Server** permission.

## How GroupCord Works

```text
Discord
   ⇅
GroupCord
   ⇅
GroupMe
```

Discord messages are received through the Discord Gateway.

GroupMe messages are received through a callback webhook handled by GroupCord's Express web server.

Bridge settings are stored in a local SQLite database.

## Requirements

- Node.js 20 or newer
- npm
- A Discord application and bot
- A GroupMe bot
- A GroupMe access token
- A publicly reachable HTTPS callback URL
- Discord permissions:
  - View Channels
  - Send Messages
  - Read Message History
  - Manage Webhooks

## Installation

Clone the repository:

```bash
git clone https://github.com/camdaloon/GroupCord.git
cd GroupCord
```

Install dependencies:

```bash
npm install
```

Copy the environment template:

### Windows Command Prompt

```cmd
copy .env.example .env
```

### PowerShell, macOS, or Linux

```bash
cp .env.example .env
```

Open `.env` and add your credentials.

Start GroupCord:

```bash
npm start
```

For development with automatic restarting:

```bash
npm run dev
```

## Environment Variables

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=

GROUPME_BOT_ID=
GROUPME_ACCESS_TOKEN=

PORT=3000
```

| Variable | Purpose |
|---|---|
| `DISCORD_TOKEN` | Discord bot token |
| `CLIENT_ID` | Discord application ID |
| `GUILD_ID` | Development Discord server ID |
| `GROUPME_BOT_ID` | Default GroupMe bot ID used during development |
| `GROUPME_ACCESS_TOKEN` | GroupMe account access token used for image uploads |
| `PORT` | Express web-server port |

Never commit `.env` or expose any token publicly.

## Discord Setup

1. Open the Discord Developer Portal.
2. Create an application named **GroupCord**.
3. Create a bot for the application.
4. Enable **Message Content Intent**.
5. Invite the bot with these scopes:
   - `bot`
   - `applications.commands`
6. Grant:
   - View Channels
   - Send Messages
   - Read Message History
   - Manage Webhooks

## GroupMe Setup

1. Open the GroupMe developer website.
2. Create a bot for the GroupMe group.
3. Copy its Bot ID.
4. Start GroupCord and expose port `3000` through a public HTTPS URL.
5. Set the GroupMe bot callback URL to:

```text
https://YOUR-PUBLIC-DOMAIN/webhook/groupme/YOUR_GROUPME_BOT_ID
```

For local development, a temporary tunnel such as ngrok can be used:

```bash
ngrok http 3000
```

The temporary URL may change whenever the tunnel restarts.

## Creating a Bridge

Run `/setup` in Discord.

Select:

- The Discord text channel
- The GroupMe Bot ID

GroupCord will:

1. Create or reuse a Discord webhook.
2. Store the bridge in SQLite.
3. Route messages in both directions.
4. Preserve GroupMe usernames and avatars in Discord.

## Data Files

GroupCord creates these files locally:

```text
groupcord.sqlite
groupcord.sqlite-shm
groupcord.sqlite-wal
```

They contain bridge configuration and message metadata. They are excluded from Git.

## Current Limitations

- GroupMe does not provide reliable callback events for message edits or deletions.
- Discord edits and deletions are sent to GroupMe as notices rather than modifying the original mirrored message.
- Replies are displayed as quoted context rather than native cross-platform replies.
- Some non-image GroupMe attachments may be forwarded as links.
- Discord custom server emojis are forwarded as names and CDN links.
- Local development requires a tunnel or publicly reachable server.

## Security

Never commit or publish:

- `.env`
- Discord bot tokens
- GroupMe access tokens
- Discord webhook tokens
- SQLite database files

Reset a token immediately if it is accidentally exposed.

To report a security issue, avoid opening a public issue containing credentials or sensitive information.

## Project Structure

```text
GroupCord/
├── src/
│   ├── commands/
│   ├── config/
│   ├── database/
│   ├── discord/
│   │   └── events/
│   ├── groupme/
│   ├── util/
│   ├── web/
│   └── index.js
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── ROADMAP.md
├── package-lock.json
└── package.json
```

## Roadmap

See [ROADMAP.md](ROADMAP.md).

Planned work includes:

- Better file forwarding
- Improved custom emoji handling
- Docker support
- PostgreSQL support
- Web dashboard
- Discord login
- Easier GroupMe linking
- Public hosted version
- Voting and bill-management features

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

GroupCord is released under the [MIT License](LICENSE).