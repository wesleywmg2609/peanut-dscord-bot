import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Lists available commands.');

export async function execute(interaction, { commands }) {
  const commandData = [...commands.values()]
    .map((command) => command.data)
    .sort((firstCommand, secondCommand) =>
      firstCommand.name.localeCompare(secondCommand.name),
    );
  const longestNameLength = Math.max(
    ...commandData.map((command) => command.name.length),
  );
  const commandList = commandData
    .map((command) => {
      const commandName = `/${command.name}`.padEnd(longestNameLength + 1);

      return `${commandName}  ${command.description}`;
    })
    .join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Available Commands')
    .setDescription(`\`\`\`\n${commandList}\n\`\`\``);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
