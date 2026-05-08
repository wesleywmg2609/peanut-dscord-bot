# Peanut Bot

Peanut is a custom Discord bot built with Node.js and discord.js.

## Files

### `deploy-commands.js`

Registers Peanut's slash commands with Discord.

Run this when you add, remove, or change a slash command, such as `/ping`.

```powershell
pnpm run deploy
```

This script does not keep the bot online. It only tells Discord which slash commands Peanut supports.

### `index.js`

Starts the bot and keeps it online while the command is running.

Run this when you want Peanut to log in to Discord and respond to commands.

```powershell
pnpm start
```

This runs:

```powershell
node index.js
```

If you close the terminal or stop the command, Peanut goes offline.

## Usual Workflow

1. Edit commands in `deploy-commands.js` and command behavior in `index.js`.
2. Register slash commands:

```powershell
pnpm run deploy
```

3. Start the bot:

```powershell
pnpm start
```

4. Test Peanut in Discord, for example:

```text
/ping
```

## Environment Variables

Peanut reads secrets and IDs from `.env`.

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_test_server_id_here
COMMAND_DEPLOY_SCOPE=guild
```

Use `COMMAND_DEPLOY_SCOPE=guild` while developing. Guild commands update quickly and only affect one server.

Use `COMMAND_DEPLOY_SCOPE=global` when you want Peanut's commands available in every server where the bot is installed. Global command updates can take longer to appear.

Server admins can configure temporary voice channels in Discord with `/settings temp-voice`.

Do not upload `.env` to GitHub. Use `.env.example` as the public template.
