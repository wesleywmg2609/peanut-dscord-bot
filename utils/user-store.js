import { db } from './database.js';

export async function getUser(guildId, userId) {
  const user = db
    .prepare(
      `
        SELECT coins, last_daily AS lastDaily
        FROM users
        WHERE guild_id = ? AND user_id = ?
      `,
    )
    .get(guildId, userId);

  return user ?? {
    coins: 0,
    lastDaily: null,
  };
}

export async function getUsers(guildId) {
  const rows = db
    .prepare(
      `
        SELECT user_id AS userId, coins, last_daily AS lastDaily
        FROM users
        WHERE guild_id = ?
      `,
    )
    .all(guildId);

  return Object.fromEntries(
    rows.map((row) => [
      row.userId,
      {
        coins: row.coins,
        lastDaily: row.lastDaily,
      },
    ]),
  );
}

export async function updateUser(guildId, userId, update) {
  const currentUser = await getUser(guildId, userId);
  const updatedUser = update(currentUser);

  db.prepare(
    `
      INSERT INTO users (guild_id, user_id, coins, last_daily)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(guild_id, user_id) DO UPDATE SET
        coins = excluded.coins,
        last_daily = excluded.last_daily
    `,
  ).run(guildId, userId, updatedUser.coins, updatedUser.lastDaily);

  return {
    coins: updatedUser.coins,
    lastDaily: updatedUser.lastDaily,
  };
}
