import {
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import {
  getGuildSettings,
  updateGuildSettings,
} from '../../utils/guild-settings-store.js';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Manages server settings.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((subcommand) =>
    subcommand
      .setName('view')
      .setDescription('Shows current server settings.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('temp-voice')
      .setDescription('Sets the join-to-create voice channel.')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('The voice channel users join to create temp rooms.')
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('clear-temp-voice')
      .setDescription('Disables temporary voice channel creation.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('error-log')
      .setDescription('Sets the error log channel.')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('The text channel for error logs.')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('clear-error-log')
      .setDescription('Disables error log messages.'),
  );

export async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: 'Settings can only be used in a server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'view') {
    await showSettings(interaction);
    return;
  }

  if (subcommand === 'temp-voice') {
    await setTempVoiceChannel(interaction);
    return;
  }

  if (subcommand === 'clear-temp-voice') {
    await clearTempVoiceChannel(interaction);
    return;
  }

  if (subcommand === 'error-log') {
    await setLogChannel(interaction);
    return;
  }

  if (subcommand === 'clear-error-log') {
    await clearLogChannel(interaction);
  }
}

async function showSettings(interaction) {
  const settings = await getGuildSettings(interaction.guildId);
  const tempVoiceValue = settings.tempVoiceChannelId
    ? `<#${settings.tempVoiceChannelId}>`
    : 'Disabled';
  const logChannelValue = settings.errorLogChannelId
    ? `<#${settings.errorLogChannelId}>`
    : 'Disabled';
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Server Settings')
    .addFields(
      {
        name: 'Temporary Voice Channel',
        value: tempVoiceValue,
      },
      {
        name: 'Error Log Channel',
        value: logChannelValue,
      },
    );

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function setLogChannel(interaction) {
  const channel = interaction.options.getChannel('channel', true);

  await updateGuildSettings(interaction.guildId, (settings) => {
    return {
      ...settings,
      errorLogChannelId: channel.id,
    };
  });

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('Error Logging Enabled')
    .setDescription(`Bot errors will be logged in ${channel}.`);

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function clearLogChannel(interaction) {
  await updateGuildSettings(interaction.guildId, (settings) => {
    return {
      ...settings,
      errorLogChannelId: null,
    };
  });

  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('Error Logging Disabled')
    .setDescription('Bot errors will no longer be sent to an error log channel.');

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function setTempVoiceChannel(interaction) {
  const channel = interaction.options.getChannel('channel', true);

  await updateGuildSettings(interaction.guildId, (settings) => {
    return {
      ...settings,
      tempVoiceChannelId: channel.id,
    };
  });

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('Temporary Voice Channels Enabled')
    .setDescription(`Users who join ${channel} will get a temporary voice channel.`);

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function clearTempVoiceChannel(interaction) {
  await updateGuildSettings(interaction.guildId, (settings) => {
    return {
      ...settings,
      tempVoiceChannelId: null,
    };
  });

  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('Temporary Voice Channels Disabled')
    .setDescription('Users will no longer create temporary channels by joining a voice channel.');

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}
