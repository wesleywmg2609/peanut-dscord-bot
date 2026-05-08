import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REST, Routes } from 'discord.js';
import { loadCommands } from './utils/load-commands.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, 'commands');
const loadedCommands = await loadCommands(commandsPath);
const commands = loadedCommands.map((command) =>
  command.data.toJSON(),
);
const deployScope = process.env.COMMAND_DEPLOY_SCOPE ?? 'guild';

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const route =
  deployScope === 'global'
    ? Routes.applicationCommands(process.env.CLIENT_ID)
    : Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      );

await rest.put(route, { body: commands });

console.log(`Slash commands registered: ${commands.length} (${deployScope})`);
