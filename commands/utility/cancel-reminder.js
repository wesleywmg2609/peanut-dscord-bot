import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { getReminder, getUserReminders } from '../../utils/reminder-store.js';
import { cancelReminder } from '../../utils/reminder-scheduler.js';

export const data = new SlashCommandBuilder()
  .setName('cancel-reminder')
  .setDescription('Cancels one of your active reminders.');

export async function execute(interaction) {
  const reminders = await getUserReminders(interaction.user.id);

  if (reminders.length === 0) {
    await interaction.reply({
      content: 'You do not have any active reminders.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`cancel-reminder:${interaction.user.id}`)
    .setPlaceholder('Select a reminder to cancel')
    .addOptions(
      reminders.slice(0, 25).map(([reminderId, reminder]) => {
        return {
          label: truncateText(reminder.message, 100),
          description: `Due ${formatDate(reminder.remindAt)}`,
          value: reminderId,
        };
      }),
    );
  const row = new ActionRowBuilder().addComponents(menu);

  await interaction.reply({
    content: 'Select the reminder you want to cancel.',
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

export async function handleSelectMenu(interaction) {
  const [, userId] = interaction.customId.split(':');

  if (interaction.user.id !== userId) {
    await interaction.reply({
      content: 'This cancellation menu is not for you.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const [reminderId] = interaction.values;
  const reminder = await getReminder(reminderId);

  if (!reminder || reminder.userId !== interaction.user.id) {
    const notFoundEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('Reminder Not Found')
      .setDescription('I could not find that active reminder.');

    await interaction.update({
      content: '',
      embeds: [notFoundEmbed],
      components: [],
    });
    return;
  }

  await cancelReminder(reminderId);

  const cancelledEmbed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('Reminder Cancelled')
    .setDescription(reminder.message);

  await interaction.update({
    content: '',
    embeds: [cancelledEmbed],
    components: [],
  });
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}
