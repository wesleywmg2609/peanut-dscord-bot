import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Lists available commands.');

export async function execute(interaction, { commands }) {
  const commandsByCategory = new Map();

  for (const command of commands.values()) {
    const commandCategory = command.category ?? 'General';
    const categoryCommands = commandsByCategory.get(commandCategory) ?? [];

    categoryCommands.push(command.data);
    commandsByCategory.set(commandCategory, categoryCommands);
  }

  const commandList = [...commandsByCategory.entries()]
    .sort(([firstCategory], [secondCategory]) =>
      firstCategory.localeCompare(secondCategory),
    )
    .map(([commandCategory, categoryCommands]) => {
      const sortedCommands = categoryCommands.sort((firstCommand, secondCommand) =>
        firstCommand.name.localeCompare(secondCommand.name),
      );
      const longestNameLength = Math.max(
        ...sortedCommands.map((command) => command.name.length),
      );
      const commandRows = sortedCommands
        .map((command) => {
          const commandName = `/${command.name}`.padEnd(longestNameLength + 1);

          return `${commandName}  ${command.description}`;
        })
        .join('\n');

      return `${commandCategory}\n${commandRows}`;
    })
    .join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Available Commands')
    .setDescription(`\`\`\`\n${commandList}\n\`\`\``);

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
