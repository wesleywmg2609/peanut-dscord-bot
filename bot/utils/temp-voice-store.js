import { db } from './database.js';

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
  db.prepare(
    `
      INSERT INTO temp_voice_channels (
        channel_id,
        guild_id,
        owner_id,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `,
  ).run(
    channelId,
    tempVoiceChannel.guildId,
    tempVoiceChannel.ownerId,
    tempVoiceChannel.createdAt,
  );

  return tempVoiceChannel;
}

/**
 * @param {string} channelId
 * @returns {Promise<TempVoiceChannel | null>}
 */
export async function getTempVoiceChannel(channelId) {
  const tempVoiceChannel = /** @type {TempVoiceChannel | undefined} */ (
    db
      .prepare(
        `
          SELECT
            guild_id AS guildId,
            owner_id AS ownerId,
            created_at AS createdAt
          FROM temp_voice_channels
          WHERE channel_id = ?
        `,
      )
      .get(channelId)
  );

  return tempVoiceChannel ?? null;
}

/**
 * @param {string} channelId
 * @returns {Promise<void>}
 */
export async function deleteTempVoiceChannel(channelId) {
  db.prepare('DELETE FROM temp_voice_channels WHERE channel_id = ?').run(channelId);
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

  db.prepare(
    `
      UPDATE temp_voice_channels
      SET
        guild_id = ?,
        owner_id = ?,
        created_at = ?
      WHERE channel_id = ?
    `,
  ).run(
    updatedTempVoiceChannel.guildId,
    updatedTempVoiceChannel.ownerId,
    updatedTempVoiceChannel.createdAt,
    channelId,
  );

  return updatedTempVoiceChannel;
}