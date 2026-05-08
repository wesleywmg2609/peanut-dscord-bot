import { SlashCommandBuilder } from 'discord.js';
import { getUser } from '../../utils/user-store.js';

export const data = new SlashCommandBuilder()
  .setName('balance')
  .setDescription('Shows your coin balance.');

export async function execute(interaction) {
  const user = await getUser(interaction.guildId, interaction.user.id);

  await interaction.reply(`You have ${user.coins} coins.`);
}
