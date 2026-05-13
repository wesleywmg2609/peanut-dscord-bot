import { query } from './database.js';

/**
 * @typedef {Object} TempVoiceChannel
 * @property {string} ownerId
 * @property {string} guildId
 * @property {number} createdAt
 */

/**
 * @param {string} channelId
 * @returns {Promise<TempVoiceChannel | null>}
 */
export async function createTempVoiceChannel(channelId, tempVoiceChannel) {
  await query(
    `
      INSERT INTO temp_voice_channels (
        channel_id,
        guild_id,
        owner_id,
        created_at
      )
      VALUES ($1, $2, $3, $4)
    `,
    [
      channelId,
      tempVoiceChannel.guildId,
      tempVoiceChannel.ownerId,
      tempVoiceChannel.createdAt,
    ],
  );

  return tempVoiceChannel;
}

/**
 * @param {string} channelId
 * @returns {Promise<TempVoiceChannel | null>}
 */
export async function getTempVoiceChannel(channelId) {
  const result = await query(
    `
      SELECT
        guild_id AS "guildId",
        owner_id AS "ownerId",
        created_at AS "createdAt"
      FROM temp_voice_channels
      WHERE channel_id = $1
    `,
    [channelId],
  );
  const tempVoiceChannel = /** @type {TempVoiceChannel | undefined} */ (result.rows[0]);

  if (!tempVoiceChannel) {
    return null;
  }

  return {
    ...tempVoiceChannel,
    createdAt: Number(tempVoiceChannel.createdAt),
  };
}

/**
 * @param {string} channelId
 * @returns {Promise<void>}
 */
export async function deleteTempVoiceChannel(channelId) {
  await query('DELETE FROM temp_voice_channels WHERE channel_id = $1', [channelId]);
}

/**
 * @param {string} channelId
 * @param {(channel: TempVoiceChannel) => TempVoiceChannel} update
 * @returns {Promise<TempVoiceChannel | null>}
 */
export async function updateTempVoiceChannel(channelId, update) {
  const tempVoiceChannel = await getTempVoiceChannel(channelId);

  if (!tempVoiceChannel) {
    return null;
  }

  const updatedTempVoiceChannel = update(tempVoiceChannel);

  await query(
    `
      UPDATE temp_voice_channels
      SET
        guild_id = $1,
        owner_id = $2,
        created_at = $3
      WHERE channel_id = $4
    `,
    [
      updatedTempVoiceChannel.guildId,
      updatedTempVoiceChannel.ownerId,
      updatedTempVoiceChannel.createdAt,
      channelId,
    ],
  );

  return updatedTempVoiceChannel;
}
