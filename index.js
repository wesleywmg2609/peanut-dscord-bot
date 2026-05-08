import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { loadCommands } from './utils/load-commands.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, 'commands');
const commands = new Map();

for (const command of await loadCommands(commandsPath)) {
  commands.set(command.data.name, command);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
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
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: 'There was an error while running this command.',
    ephemeral: true,
  });
}

client.login(process.env.DISCORD_TOKEN);
