import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getReminder } from '../../utils/reminder-store.js';
import { cancelReminder } from '../../utils/reminder-scheduler.js';

export const data = new SlashCommandBuilder()
  .setName('cancel-reminder')
  .setDescription('Cancels one of your active reminders.')
  .addStringOption((option) =>
    option
      .setName('id')
      .setDescription('The reminder ID from /reminders.')
      .setRequired(true),
  );

export async function execute(interaction) {
  const reminderId = interaction.options.getString('id', true);
  const reminder = await getReminder(reminderId);

  if (!reminder || reminder.userId !== interaction.user.id) {
    await interaction.reply({
      content: 'I could not find an active reminder with that ID.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await cancelReminder(reminderId);

  await interaction.reply({
    content: 'Reminder cancelled.',
    flags: MessageFlags.Ephemeral,
  });
}
