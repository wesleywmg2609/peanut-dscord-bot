import { db } from './database.js';

export async function getGuildSettings(guildId) {
  const settings = db
    .prepare(
      `
        SELECT
          temp_voice_channel_id AS tempVoiceChannelId,
          error_log_channel_id AS errorLogChannelId
        FROM guild_settings
        WHERE guild_id = ?
      `,
    )
    .get(guildId);

  return settings ?? {
    tempVoiceChannelId: null,
    errorLogChannelId: null,
  };
}

export async function updateGuildSettings(guildId, update) {
  const currentSettings = await getGuildSettings(guildId);
  const updatedSettings = update(currentSettings);

  db.prepare(
    `
      INSERT INTO guild_settings (
        guild_id,
        temp_voice_channel_id,
        error_log_channel_id
      )
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        temp_voice_channel_id = excluded.temp_voice_channel_id,
        error_log_channel_id = excluded.error_log_channel_id
    `,
  ).run(
    guildId,
    updatedSettings.tempVoiceChannelId,
    updatedSettings.errorLogChannelId,
  );

  return updatedSettings;
}
