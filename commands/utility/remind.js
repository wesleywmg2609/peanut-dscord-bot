import { MessageFlags, SlashCommandBuilder } from 'discord.js';

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

  setTimeout(async () => {
    try {
      await interaction.user.send(`Reminder: ${message}`);
    } catch (error) {
      console.error(error);
    }
  }, reminderTime);

  await interaction.reply({
    content: `Reminder set. I will DM you in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    flags: MessageFlags.Ephemeral,
  });
}
