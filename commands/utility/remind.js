import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { createReminder } from '../../utils/reminder-store.js';
import { scheduleReminder } from '../../utils/reminder-scheduler.js';

const maxMinutes = 60 * 24 * 7;

export const data = new SlashCommandBuilder()
  .setName('remind')
  .setDescription('Sets a reminder.')
  .addIntegerOption((option) =>
    option
      .setName('minutes')
      .setDescription('How many minutes from now to remind you.')
      .setMinValue(1)
      .setMaxValue(maxMinutes)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('What you want to be reminded about.')
      .setRequired(true),
  );

export async function execute(interaction) {
  const minutes = interaction.options.getInteger('minutes', true);
  const message = interaction.options.getString('message', true);
  const reminderTime = minutes * 60 * 1000;
  const remindAt = Date.now() + reminderTime;
  const reminderTimestamp = Math.floor(remindAt / 1000);
  const reminderId = interaction.id;
  const reminder = {
    userId: interaction.user.id,
    guildName: interaction.guild?.name ?? 'Direct Message',
    message,
    remindAt,
    createdAt: Date.now(),
  };

  await createReminder(reminderId, reminder);
  scheduleReminder(interaction.client, reminderId, reminder);

  const confirmationEmbed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('Reminder Set')
    .setDescription(message)
    .addFields({
      name: 'When',
      value: `<t:${reminderTimestamp}:R>`,
    });

  await interaction.reply({
    embeds: [confirmationEmbed],
    flags: MessageFlags.Ephemeral,
  });
}
