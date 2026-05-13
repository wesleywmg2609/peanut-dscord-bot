# Peanut Bot

Peanut is a custom Discord bot built with Node.js, discord.js, PostgreSQL, and Docker.

## Setup

Create `bot/.env` from `bot/.env.example` and fill in your Discord values:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id_here
```

`DATABASE_URL` is set automatically by Docker Compose for the bot container. Keep the `DATABASE_URL` value in `bot/.env` only if you also run the bot locally without Docker.

Do not upload `bot/.env` to GitHub.

## Main Commands

Start the bot:

```powershell
docker compose up -d --build bot
```

This rebuilds the bot image, starts PostgreSQL, then starts the bot in the background.

Deploy Discord slash commands:

```powershell
docker compose --profile tools run --rm deploy
```

Run this after adding, removing, or changing slash commands. This does not keep the bot online; it only registers commands with Discord.

Open the database UI:

```powershell
docker compose --profile tools up -d adminer
```

Then open:

```text
http://localhost:8080
```

Adminer login:

```text
System: PostgreSQL
Server: postgresql
Username: peanut
Password: peanut
Database: peanut
```

View bot logs:

```powershell
docker compose logs -f bot
```

Stop everything:

```powershell
docker compose --profile tools down
```

## Docker Services

`bot`

Runs Peanut using `bot/Dockerfile`. It reads Discord credentials from `bot/.env` and connects to PostgreSQL with the Compose-provided `DATABASE_URL`.

`postgresql`

Runs PostgreSQL 17. Database files are stored in the Docker volume `postgres-data`, so data survives container rebuilds.

`deploy`

Runs `pnpm run deploy` once to register Discord slash commands. This service is behind the `tools` profile, so it only runs when requested.

`adminer`

Runs a browser UI for PostgreSQL at `http://localhost:8080`. This service is also behind the `tools` profile.

## Development Notes

Edit slash commands in `bot/commands`.

Edit bot startup and event handling in `bot/index.js`.

Edit database tables and queries in `bot/utils/database.js` and the store files in `bot/utils`.

After changing bot code, run:

```powershell
docker compose up -d --build bot
```

After changing slash command definitions, run:

```powershell
docker compose --profile tools run --rm deploy
```

Server admins can configure temporary voice channels in Discord with `/settings temp-voice`.
