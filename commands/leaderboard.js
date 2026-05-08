import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getUsers } from '../utils/user-store.js';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Shows the top coin balances.');

export async function execute(interaction) {
  const users = await getUsers();
  const leaderboard = Object.entries(users)
    .filter(([, user]) => user.coins > 0)
    .sort(([, firstUser], [, secondUser]) => secondUser.coins - firstUser.coins)
    .slice(0, 10);

  if (leaderboard.length === 0) {
    await interaction.reply('No one has coins yet.');
    return;
  }

  const description = leaderboard
    .map(([userId, user], index) => {
      return `${index + 1}. <@${userId}> - ${user.coins} coins`;
    })
    .join('\n');

  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle('Coin Leaderboard')
    .setDescription(description);

  await interaction.reply({ embeds: [embed] });
}
