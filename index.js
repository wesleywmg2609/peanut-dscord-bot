import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { loadCommands } from './utils/load-commands.js';
import { schedulePendingReminders } from './utils/reminder-scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, 'commands');
const loadedCommands = await loadCommands(commandsPath);
const commands = new Map();

for (const command of loadedCommands) {
  commands.set(command.data.name, command);
}

console.log(`Loaded ${commands.size} commands:`);
for (const command of loadedCommands) {
  console.log(`- /${command.data.name}`);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  await schedulePendingReminders(client);
  console.log('Pending reminders scheduled.');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    const commandName = interaction.customId.split(':')[0];
    const command = commands.get(commandName);

    if (!command?.handleButton) return;

    try {
      await command.handleButton(interaction);
    } catch (error) {
      await handleInteractionError(interaction, error);
    }

    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, { commands });
  } catch (error) {
    await handleInteractionError(interaction, error);
  }
});

async function handleInteractionError(interaction, error) {
  console.error(error);

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({
      content: 'There was an error while running this command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply({
    content: 'There was an error while running this command.',
    flags: MessageFlags.Ephemeral,
  });
}

client.login(process.env.DISCORD_TOKEN);
