import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REST, Routes } from 'discord.js';
import { getDeployEnv } from './utils/env.js';
import { loadCommands } from './utils/load-commands.js';

const env = getDeployEnv();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, 'commands');
const loadedCommands = await loadCommands(commandsPath);
const commands = loadedCommands.map((command) => command.data.toJSON());

const rest = new REST().setToken(env.discordToken);

await rest.put(Routes.applicationCommands(env.clientId), {
  body: commands,
});

console.log(`Global slash commands registered: ${commands.length}`);