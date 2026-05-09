import { EmbedBuilder, MessageFlags } from 'discord.js';

export function isAccessError(error) {
  return error.code === 50001 || error.code === 50013;
}

export async function replyWithPermissionAccessError(interaction) {
  await interaction.reply({
    content:
      'I could not edit this channel permissions.',
    flags: MessageFlags.Ephemeral,
  });
}

export async function replyWithSuccess(
  interaction,
  title,
  description,
) {
  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle(title)
    .setDescription(description);

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}