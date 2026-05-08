import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('server')
  .setDescription('Shows information about this server.');

export async function execute(interaction) {
  const { guild } = interaction;

  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL())
    .addFields(
      {
        name: 'Members',
        value: guild.memberCount.toString(),
        inline: true,
      },
      {
        name: 'Created',
        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
        inline: true,
      },
      {
        name: 'Server ID',
        value: guild.id,
      },
    );

  await interaction.reply({ embeds: [embed] });
}
