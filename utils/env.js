const validDeployScopes = new Set(['guild', 'global']);

export function getBotEnv() {
  return {
    discordToken: getRequiredEnv('DISCORD_TOKEN'),
    tempVoiceChannelId: process.env.TEMP_VOICE_CHANNEL_ID || null,
  };
}

export function getDeployEnv() {
  const commandDeployScope = process.env.COMMAND_DEPLOY_SCOPE ?? 'guild';

  if (!validDeployScopes.has(commandDeployScope)) {
    throw new Error(
      'COMMAND_DEPLOY_SCOPE must be either "guild" or "global".',
    );
  }

  return {
    discordToken: getRequiredEnv('DISCORD_TOKEN'),
    clientId: getRequiredEnv('CLIENT_ID'),
    guildId:
      commandDeployScope === 'guild' ? getRequiredEnv('GUILD_ID') : null,
    commandDeployScope,
  };
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
