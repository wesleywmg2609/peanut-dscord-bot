const validDeployScopes = new Set(['guild', 'global']);

export function getBotEnv() {
  return {
    discordToken: getRequiredEnv('DISCORD_TOKEN'),
  };
}

export function getDeployEnv() {
  return {
    discordToken: getRequiredEnv('DISCORD_TOKEN'),
    clientId: getRequiredEnv('CLIENT_ID'),
  };
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}