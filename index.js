import 'dotenv/config';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Client, GatewayIntentBits, Events } from 'discord.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = (await readdir(commandsPath)).filter((file) =>
  file.endsWith('.js'),
);
const commands = new Map();

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(pathToFileURL(filePath));

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
