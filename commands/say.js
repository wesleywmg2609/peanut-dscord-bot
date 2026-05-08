import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Repeats your message.')
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('The message for Peanut to say.')
      .setRequired(true),
  );

export async function execute(interaction) {
  const message = interaction.options.getString('message', true);
  await interaction.reply(message);
}
