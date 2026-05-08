import { db } from './database.js';

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

export async function deleteReminder(reminderId) {
  db.prepare('DELETE FROM reminders WHERE id = ?').run(reminderId);
}

export async function getReminder(reminderId) {
  const reminder = db
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
    .get(reminderId);

  return reminder ?? null;
}

export async function getReminders() {
  const reminders = db
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
    .all();

  return Object.fromEntries(
    reminders.map((reminder) => {
      const { id, ...reminderData } = reminder;

      return [id, reminderData];
    }),
  );
}

export async function getUserReminders(userId) {
  const reminders = db
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
    .all(userId);

  return reminders.map((reminder) => {
    const { id, ...reminderData } = reminder;

    return [id, reminderData];
  });
}
