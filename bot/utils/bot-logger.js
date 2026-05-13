import { getGuildSettings } from './guild-settings-store.js';
import { truncateText } from './text.js';
import { createErrorEmbed } from './embed.js';

export async function logError(client, guildId, error, context) {
  if (!guildId) return;

  const settings = await getGuildSettings(guildId);
  if (!settings.errorLogChannelId) return;

  const channel = await client.channels
    .fetch(settings.errorLogChannelId)
    .catch(() => null);
  if (!channel?.isTextBased()) return;

  const fields = [
    {
      name: 'Context',
      value: truncateText(context, 1024),
    },
    {
      name: 'Error Name',
      value: truncateText(error?.name ?? 'UnknownError', 1024),
      inline: true,
    },
    {
      name: 'Message',
      value: truncateText(error?.message ?? String(error), 1024),
      inline: true,
    },
  ];

  fields.push({
    name: 'Stack',
    value: truncateText(error?.stack ?? String(error), 1024),
  });

  const embed = createErrorEmbed('Bot Error')
    .addFields(fields)
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}
