import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embed.js';

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription('Shows a user avatar.')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user whose avatar you want to see.'),
  );

export async function execute(interaction) {
  const user = interaction.options.getUser('user') ?? interaction.user;
  const avatarUrl = user.displayAvatarURL({ size: 1024 });

  const embed = createInfoEmbed(`${user.username}'s Avatar`)
    .setImage(avatarUrl)
    .setURL(avatarUrl);

  await interaction.reply({ embeds: [embed] });
}
