import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REST, Routes } from 'discord.js';
import { loadCommands } from './utils/load-commands.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, 'commands');
const commands = (await loadCommands(commandsPath)).map((command) =>
  command.data.toJSON(),
);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

await rest.put(
  Routes.applicationGuildCommands(
    process.env.CLIENT_ID,
    process.env.GUILD_ID,
  ),
  { body: commands },
);

console.log('Slash commands registered.');
