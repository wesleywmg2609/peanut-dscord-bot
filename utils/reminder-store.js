import { db } from './database.js';

/**
 * @typedef {Object} Reminder
 * @property {string} userId
 * @property {string} guildName
 * @property {string} message
 * @property {number} remindAt
 * @property {number} createdAt
 */

/**
 * @typedef {Reminder & { id: string }} ReminderRow
 */

/**
 * @param {string} reminderId
 * @param {Reminder} reminder
 * @returns {Promise<Reminder>}
 */
export async function createReminder(reminderId, reminder) {
  db.prepare(
    `
      INSERT INTO reminders (
        id,
        user_id,
        guild_name,
        message,
        remind_at,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run(
    reminderId,
    reminder.userId,
    reminder.guildName,
    reminder.message,
    reminder.remindAt,
    reminder.createdAt,
  );

  return reminder;
}

/**
 * @param {string} reminderId
 * @returns {Promise<void>}
 */
export async function deleteReminder(reminderId) {
  db.prepare('DELETE FROM reminders WHERE id = ?').run(reminderId);
}

/**
 * @param {string} reminderId
 * @returns {Promise<Reminder | null>}
 */
export async function getReminder(reminderId) {
  const reminder = /** @type {Reminder | undefined} */ (
    db
      .prepare(
        `
          SELECT
            user_id AS userId,
            guild_name AS guildName,
            message,
            remind_at AS remindAt,
            created_at AS createdAt
          FROM reminders
          WHERE id = ?
        `,
      )
      .get(reminderId)
  );

  return reminder ?? null;
}

/**
 * @returns {Promise<Record<string, Reminder>>}
 */
export async function getReminders() {
  const reminders = /** @type {ReminderRow[]} */ (
    db
      .prepare(
        `
          SELECT
            id,
            user_id AS userId,
            guild_name AS guildName,
            message,
            remind_at AS remindAt,
            created_at AS createdAt
          FROM reminders
        `,
      )
      .all()
  );

  return Object.fromEntries(
    reminders.map((reminder) => {
      const { id, ...reminderData } = reminder;

      return [id, reminderData];
    }),
  );
}

/**
 * @param {string} userId
 * @returns {Promise<[string, Reminder][]>}
 */
export async function getUserReminders(userId) {
  const reminders = /** @type {ReminderRow[]} */ (
    db
      .prepare(
        `
          SELECT
            id,
            user_id AS userId,
            guild_name AS guildName,
            message,
            remind_at AS remindAt,
            created_at AS createdAt
          FROM reminders
          WHERE user_id = ?
          ORDER BY remind_at ASC
        `,
      )
      .all(userId)
  );

  return reminders.map((reminder) => {
    const { id, ...reminderData } = reminder;

    return [id, reminderData];
  });
}
