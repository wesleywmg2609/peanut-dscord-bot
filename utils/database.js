import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data');
const databasePath = path.join(dataPath, 'peanut.db');

mkdirSync(dataPath, { recursive: true });

export const db = new Database(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    guild_name TEXT NOT NULL,
    message TEXT NOT NULL,
    remind_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    votes TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    temp_voice_channel_id TEXT,
    error_log_channel_id TEXT
  );
`);

const guildSettingsColumns = db
  .prepare('PRAGMA table_info(guild_settings)')
  .all()
  .map((column) => column.name);

if (!guildSettingsColumns.includes('error_log_channel_id')) {
  db.exec('ALTER TABLE guild_settings ADD COLUMN error_log_channel_id TEXT');
}

if (guildSettingsColumns.includes('log_channel_id')) {
  db.exec(`
    UPDATE guild_settings
    SET error_log_channel_id = COALESCE(error_log_channel_id, log_channel_id)
  `);
  db.exec('ALTER TABLE guild_settings DROP COLUMN log_channel_id');
}
