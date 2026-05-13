import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: getDatabaseUrl(),
});

let schemaReadyPromise;

export async function query(text, params) {
  await initSchema();
  return pool.query(text, params);
}

async function initSchema() {
  schemaReadyPromise ??= pool.query(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      allowed_bot_channel_id TEXT,
      temp_voice_channel_id TEXT,
      error_log_channel_id TEXT
    );

    CREATE TABLE IF NOT EXISTS temp_voice_channels (
      channel_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      guild_name TEXT NOT NULL,
      message TEXT NOT NULL,
      remind_at BIGINT NOT NULL,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      votes JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `);

  return schemaReadyPromise;
}

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.POSTGRES_HOST ?? 'postgresql';
  const port = process.env.POSTGRES_PORT ?? '5432';
  const user = getRequiredEnv('POSTGRES_USER');
  const password = encodeURIComponent(getRequiredEnv('POSTGRES_PASSWORD'));
  const database = getRequiredEnv('POSTGRES_DB');

  return `postgres://${user}:${password}@${host}:${port}/${database}`;
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
