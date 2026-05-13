import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { logError } from './utils/bot-logger.js';
import { getBotEnv } from './utils/env.js';
import { loadCommands } from './utils/load-commands.js';
import { handleTempVoiceStateUpdate } from './utils/temp-voice.js';
import { getGuildSettings } from './utils/guild-settings-store.js';

const env = getBotEnv();
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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    const commandName = interaction.customId.split(':')[0];
    const command = commands.get(commandName);

    if (!command?.handleSelectMenu) return;

    try {
      await command.handleSelectMenu(interaction);
    } catch (error) {
      await handleInteractionError(interaction, error);
    }

    return;
  }

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

  const settings = await getGuildSettings(interaction.guildId);

  if (
    settings.allowedBotChannelId &&
    interaction.channelId !== settings.allowedBotChannelId
  ) {
    await interaction.reply({
      content: `Please use commands in <#${settings.allowedBotChannelId}>.`,
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  try {
    await command.execute(interaction, { commands });
  } catch (error) {
    await handleInteractionError(interaction, error);
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    await handleTempVoiceStateUpdate(oldState, newState, env);
  } catch (error) {
    console.error(error);
    await logError(newState.client, newState.guild.id, error, 'VoiceStateUpdate');
  }
});

async function handleInteractionError(interaction, error) {
  console.error(error);
  await logError(
    interaction.client,
    interaction.guildId,
    error,
    `/${interaction.commandName ?? interaction.customId}`,
  );

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

client.login(env.discordToken);
