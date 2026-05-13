import { query } from './database.js';

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
  const result = await query(
    `
      SELECT
        allowed_bot_channel_id AS "allowedBotChannelId",
        temp_voice_channel_id AS "tempVoiceChannelId",
        error_log_channel_id AS "errorLogChannelId"
      FROM guild_settings
      WHERE guild_id = $1
    `,
    [guildId],
  );
  const settings = /** @type {GuildSettings | undefined} */ (result.rows[0]);

  return settings ?? {
    allowedBotChannelId: null,
    tempVoiceChannelId: null,
    errorLogChannelId: null,
  };
}

export async function updateGuildSettings(guildId, update) {
  const currentSettings = await getGuildSettings(guildId);
  const updatedSettings = update(currentSettings);

  await query(
    `
      INSERT INTO guild_settings (
        guild_id,
        allowed_bot_channel_id,
        temp_voice_channel_id,
        error_log_channel_id
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT(guild_id) DO UPDATE SET
        allowed_bot_channel_id = EXCLUDED.allowed_bot_channel_id,
        temp_voice_channel_id = EXCLUDED.temp_voice_channel_id,
        error_log_channel_id = EXCLUDED.error_log_channel_id
    `,
    [
      guildId,
      updatedSettings.allowedBotChannelId,
      updatedSettings.tempVoiceChannelId,
      updatedSettings.errorLogChannelId,
    ],
  );

  return updatedSettings;
}
