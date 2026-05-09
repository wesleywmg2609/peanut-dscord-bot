import {
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { getOwnedTempVoiceChannel } from '../../utils/temp-voice.js';
import {
  isAccessError,
  replyWithPermissionAccessError,
  replyWithSuccess,
} from '../../utils/discord-response.js';
import {
  getTempVoiceChannel,
  updateTempVoiceChannel,
} from '../../utils/temp-voice-store.js';

export const data = new SlashCommandBuilder()
  .setName('voice')
  .setDescription('Manages your temporary voice channel.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('claim')
      .setDescription('Claims ownership of this temporary voice channel if the owner left.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('kick')
      .setDescription('Removes a user from your temporary voice channel.')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to kick.')
          .setRequired(true),
      ),
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
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('lock')
      .setDescription('Prevents others from joining your temporary voice channel.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('permit')
      .setDescription('Allows a user to join your locked temporary voice channel.')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to permit.')
          .setRequired(true),
      ),
  )
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
      .setName('transfer')
      .setDescription('Transfers ownership of your temporary voice channel.')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The new owner.')
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('unlock')
      .setDescription('Allows others to join your temporary voice channel.'),
  )
  ;

export async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: 'Voice controls can only be used in a server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'claim') {
    await claimChannel(interaction);
    return;
  }

  const channel = await getOwnedTempVoiceChannel(interaction.member);

  if (!channel) {
    await interaction.reply({
      content: 'You must be in your own temporary voice channel to use this.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (subcommand === 'kick') {
    await kickUser(interaction, channel);
    return;
  }

  if (subcommand === 'limit') {
    await limitUsers(interaction, channel);
  }

  if (subcommand === 'lock') {
    await lockChannel(interaction, channel);
    return;
  }

  if (subcommand === 'permit') {
    await permitUser(interaction, channel);
    return;
  }

  if (subcommand === 'rename') {
    await renameChannel(interaction, channel);
    return;
  }

  if (subcommand === 'transfer') {
    await transferChannel(interaction, channel);
    return;
  }

  if (subcommand === 'unlock') {
    await unlockChannel(interaction, channel);
    return;
  }
}

async function claimChannel(interaction) {
  const channel = interaction.member.voice.channel;

  if (!channel) {
    await interaction.reply({
      content: 'You must be in a temporary voice channel to claim it.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const tempChannel = await getTempVoiceChannel(channel.id);

  if (!tempChannel) {
    await interaction.reply({
      content: 'This is not a temporary voice channel.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (tempChannel.ownerId === interaction.user.id) {
    await interaction.reply({
      content: 'You already own this temporary voice channel.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const ownerStillInside = channel.members.has(tempChannel.ownerId);

  if (ownerStillInside) {
    await interaction.reply({
      content: 'You cannot claim this channel while the owner is still inside.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await updateTempVoiceChannel(channel.id, (current) => ({
    ...current,
    ownerId: interaction.user.id,
  }));

  await replyWithSuccess(
    interaction,
    'Voice Channel Claimed',
    `You are now the owner of ${channel}.`,
  );
}

async function kickUser(interaction, channel) {
  const user = interaction.options.getUser('user', true);
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member || member.voice.channelId !== channel.id) {
    await interaction.reply({
      content: 'That user is not in your temporary voice channel.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await member.voice.disconnect('Removed from temporary voice channel by owner.');

  await replyWithSuccess(
    interaction,
    'User Kicked',
    `${user} was removed from ${channel}.`,
  );
}

async function limitUsers(interaction, channel) {
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

async function lockChannel(interaction, channel) {
  try {
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
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

async function permitUser(interaction, channel) {
  const user = interaction.options.getUser('user', true);

  await channel.permissionOverwrites.edit(user.id, {
    ViewChannel: true,
    Connect: true,
  });

  await replyWithSuccess(
    interaction,
    'User Permitted',
    `${user} can now join ${channel}.`,
  );
}

async function renameChannel(interaction, channel) {
  const name = interaction.options.getString('name', true);

  await channel.setName(name, 'Temporary voice channel renamed by owner.');

  await replyWithSuccess(interaction, 'Voice Channel Renamed', `Renamed to ${channel}.`);
}

async function transferChannel(interaction, channel) {
  const user = interaction.options.getUser('user', true);
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member || member.voice.channelId !== channel.id) {
    await interaction.reply({
      content: 'The new owner must be inside your temporary voice channel.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await updateTempVoiceChannel(channel.id, (current) => ({
    ...current,
    ownerId: user.id,
  }));

  await replyWithSuccess(
    interaction,
    'Voice Channel Ownership Transferred',
    `${user} is now the owner of ${channel}.`,
  );
}

async function unlockChannel(interaction, channel) {
  try {
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
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