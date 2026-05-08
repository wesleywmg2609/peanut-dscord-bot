import { EmbedBuilder } from 'discord.js';
import { getGuildSettings } from './guild-settings-store.js';

export async function logError(client, guildId, error, context) {
  if (!guildId) return;

  const settings = await getGuildSettings(guildId);
  if (!settings.errorLogChannelId) return;

  const channel = await client.channels
    .fetch(settings.errorLogChannelId)
    .catch(() => null);
  if (!channel?.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('Bot Error')
    .addFields(
      {
        name: 'Context',
        value: context,
      },
      {
        name: 'Error',
        value: truncateText(error?.stack ?? String(error), 1000),
      },
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}
