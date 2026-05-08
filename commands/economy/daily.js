import { SlashCommandBuilder } from 'discord.js';
import { updateUser } from '../../utils/user-store.js';

const dailyAmount = 100;
const dailyCooldown = 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder()
  .setName('daily')
  .setDescription('Claims your daily coins.');

export async function execute(interaction) {
  const now = Date.now();
  let claimed = false;

  const user = await updateUser(interaction.user.id, (currentUser) => {
    if (currentUser.lastDaily && now - currentUser.lastDaily < dailyCooldown) {
      return currentUser;
    }

    claimed = true;

    return {
      ...currentUser,
      coins: currentUser.coins + dailyAmount,
      lastDaily: now,
    };
  });

  if (!claimed) {
    const nextDaily = Math.floor((user.lastDaily + dailyCooldown) / 1000);

    await interaction.reply({
      content: `You already claimed your daily reward. Try again <t:${nextDaily}:R>.`,
      ephemeral: true,
    });
    return;
  }

  await interaction.reply(
    `You claimed ${dailyAmount} coins. You now have ${user.coins} coins.`,
  );
}
