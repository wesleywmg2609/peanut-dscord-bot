import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getUserReminders } from '../../utils/reminder-store.js';

export const data = new SlashCommandBuilder()
  .setName('reminders')
  .setDescription('Lists your active reminders.');

export async function execute(interaction) {
  const reminders = await getUserReminders(interaction.user.id);

  if (reminders.length === 0) {
    await interaction.reply({
      content: 'You do not have any active reminders.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const description = reminders
    .map(([, reminder], index) => {
      const remindAt = Math.floor(reminder.remindAt / 1000);

      return `${index + 1}. ${reminder.message}\nWhen: <t:${remindAt}:R>\nSet in: ${reminder.guildName}`;
    })
    .join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Active Reminders')
    .setDescription(description);

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}
