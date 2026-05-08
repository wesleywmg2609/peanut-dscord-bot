import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('Shows Peanut Bot stats.');

export async function execute(interaction, { commands }) {
  const uptimeSeconds = Math.floor(interaction.client.uptime / 1000);
  const memoryUsage = process.memoryUsage();
  const memoryMb = Math.round(memoryUsage.rss / 1024 / 1024);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Peanut Bot Stats')
    .addFields(
      {
        name: 'Uptime',
        value: `<t:${Math.floor(Date.now() / 1000) - uptimeSeconds}:R>`,
        inline: true,
      },
      {
        name: 'Servers',
        value: interaction.client.guilds.cache.size.toString(),
        inline: true,
      },
      {
        name: 'Commands',
        value: commands.size.toString(),
        inline: true,
      },
      {
        name: 'Memory',
        value: `${memoryMb} MB`,
        inline: true,
      },
    );

  await interaction.reply({ embeds: [embed] });
}
