import { MessageFlags } from 'discord.js';
import { createSuccessEmbed } from './embed.js';

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
  const embed = createSuccessEmbed(title, description);

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}