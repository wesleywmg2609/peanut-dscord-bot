import {
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { getOwnedTempVoiceChannel } from '../../utils/temp-voice.js';
import {
  isAccessError,
  replyWithPermissionAccessError,
  replyWithSuccess,
} from '../../utils/discord-response.js';

export const data = new SlashCommandBuilder()
  .setName('voice')
  .setDescription('Manages your temporary voice channel.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('rename')
      .setDescription('Renames your temporary voice channel.')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('The new channel name.')
          .setMinLength(1)
          .setMaxLength(100)
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('lock')
      .setDescription('Prevents others from joining your temporary voice channel.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('unlock')
      .setDescription('Allows others to join your temporary voice channel.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('limit')
      .setDescription('Sets the user limit for your temporary voice channel.')
      .addIntegerOption((option) =>
        option
          .setName('count')
          .setDescription('The user limit. Use 0 for unlimited.')
          .setMinValue(0)
          .setMaxValue(99)
          .setRequired(true),
      ),
  );

export async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: 'Voice controls can only be used in a server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const channel = getOwnedTempVoiceChannel(interaction.member);

  if (!channel) {
    await interaction.reply({
      content: 'You must be in your own temporary voice channel to use this.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'rename') {
    await renameChannel(interaction, channel);
    return;
  }

  if (subcommand === 'lock') {
    await lockChannel(interaction, channel);
    return;
  }

  if (subcommand === 'unlock') {
    await unlockChannel(interaction, channel);
    return;
  }

  if (subcommand === 'limit') {
    await setUserLimit(interaction, channel);
  }
}

async function renameChannel(interaction, channel) {
  const name = interaction.options.getString('name', true);

  await channel.setName(name, 'Temporary voice channel renamed by owner.');

  await replyWithSuccess(interaction, 'Voice Channel Renamed', `Renamed to ${channel}.`);
}

async function lockChannel(interaction, channel) {
  try {
    await channel.permissionOverwrites.edit(interaction.guild.id, {
      Connect: false,
    });
  } catch (error) {
    if (isAccessError(error)) {
      await replyWithPermissionAccessError(interaction);
      return;
    }

    throw error;
  }

  await replyWithSuccess(
    interaction,
    'Voice Channel Locked',
    'Other users can no longer join your temporary voice channel.',
  );
}

async function unlockChannel(interaction, channel) {
  try {
    await channel.permissionOverwrites.edit(interaction.guild.id, {
      Connect: null,
    });
  } catch (error) {
    if (isAccessError(error)) {
      await replyWithPermissionAccessError(interaction);
      return;
    }

    throw error;
  }

  await replyWithSuccess(
    interaction,
    'Voice Channel Unlocked',
    'Other users can join your temporary voice channel again.',
  );
}

async function setUserLimit(interaction, channel) {
  const userLimit = interaction.options.getInteger('count', true);

  await channel.setUserLimit(
    userLimit,
    'Temporary voice channel user limit changed by owner.',
  );

  await replyWithSuccess(
    interaction,
    'Voice Channel Limit Updated',
    userLimit === 0
      ? 'User limit removed.'
      : `User limit set to ${userLimit}.`,
  );
}
