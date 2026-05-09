import {
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import {
  getGuildSettings,
  updateGuildSettings,
} from '../../utils/guild-settings-store.js';
import {
  createErrorEmbed,
  createInfoEmbed,
  createSuccessEmbed,
} from '../../utils/embed.js';

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
      .setName('set-error-log')
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
      .setName('remove-error-log')
      .setDescription('Disables error log messages.'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('set-temp-voice')
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
      .setName('remove-temp-voice')
      .setDescription('Disables temporary voice channel creation.'),
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
    await viewSettings(interaction);
    return;
  }

  if (subcommand === 'set-temp-voice') {
    await setTempVoiceChannel(interaction);
    return;
  }

  if (subcommand === 'remove-temp-voice') {
    await removeTempVoiceChannel(interaction);
    return;
  }

  if (subcommand === 'set-error-log') {
    await setLogChannel(interaction);
    return;
  }

  if (subcommand === 'remove-error-log') {
    await removeLogChannel(interaction);
  }
}

async function viewSettings(interaction) {
  const settings = await getGuildSettings(interaction.guildId);
  const tempVoiceValue = settings.tempVoiceChannelId
    ? `<#${settings.tempVoiceChannelId}>`
    : 'Disabled';
  const logChannelValue = settings.errorLogChannelId
    ? `<#${settings.errorLogChannelId}>`
    : 'Disabled';
  const embed = createInfoEmbed('Server Settings')
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

  await channel.permissionOverwrites.edit(
    interaction.guild.roles.everyone,
    {
      ViewChannel: false,
      ReadMessageHistory: false,
    },
    {
      reason: 'Configured as private error log channel.',
    },
  );

  await updateGuildSettings(interaction.guildId, (settings) => {
    return {
      ...settings,
      errorLogChannelId: channel.id,
    };
  });

  const embed = createSuccessEmbed(
    'Error Logging Enabled',
    `Bot errors will be logged in ${channel}.`,
  );

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function removeLogChannel(interaction) {
  await updateGuildSettings(interaction.guildId, (settings) => {
    return {
      ...settings,
      errorLogChannelId: null,
    };
  });

  const embed = createErrorEmbed(
    'Error Logging Disabled',
    'Bot errors will no longer be sent to an error log channel.',
  );

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function setTempVoiceChannel(interaction) {
  const channel = interaction.options.getChannel('channel', true);

  await channel.permissionOverwrites.edit(
    interaction.guild.roles.everyone,
    {
      Connect: true,
      Speak: false,
      SendMessages: false,
    },
    {
      reason: 'Configured as temporary voice lobby channel.',
    },
  );

  await updateGuildSettings(interaction.guildId, (settings) => {
    return {
      ...settings,
      tempVoiceChannelId: channel.id,
    };
  });

  const embed = createSuccessEmbed(
    'Temporary Voice Channels Enabled',
    `Users who join ${channel} will get a temporary voice channel.`,
  );

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function removeTempVoiceChannel(interaction) {
  await updateGuildSettings(interaction.guildId, (settings) => {
    return {
      ...settings,
      tempVoiceChannelId: null,
    };
  });

  const embed = createErrorEmbed(
    'Temporary Voice Channels Disabled',
    'Users will no longer create temporary channels by joining a voice channel.',
  );

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}
