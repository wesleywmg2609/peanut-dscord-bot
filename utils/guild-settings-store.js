import { db } from './database.js';

/**
 * @typedef {Object} GuildSettings
 * @property {string | null} allowedBotChannelId
 * @property {string | null} tempVoiceChannelId
 * @property {string | null} errorLogChannelId
 */

/**
 * @param {string} guildId
 * @returns {Promise<GuildSettings>}
 */
export async function getGuildSettings(guildId) {
  const settings = /** @type {GuildSettings | undefined} */ (
    db
      .prepare(
        `
          SELECT
            allowed_bot_channel_id AS allowedBotChannelId,
            temp_voice_channel_id AS tempVoiceChannelId,
            error_log_channel_id AS errorLogChannelId
          FROM guild_settings
          WHERE guild_id = ?
        `,
      )
      .get(guildId)
  );

  return settings ?? {
    allowedBotChannelId: null,
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
        allowed_bot_channel_id,
        temp_voice_channel_id,
        error_log_channel_id
      )
      VALUES (?, ?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        allowed_bot_channel_id = excluded.allowed_bot_channel_id,
        temp_voice_channel_id = excluded.temp_voice_channel_id,
        error_log_channel_id = excluded.error_log_channel_id
    `,
  ).run(
    guildId,
    updatedSettings.allowedBotChannelId,
    updatedSettings.tempVoiceChannelId,
    updatedSettings.errorLogChannelId,
  );

  return updatedSettings;
}
