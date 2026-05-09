import { ChannelType } from 'discord.js';
import { getGuildSettings } from './guild-settings-store.js';
import { isAccessError } from './discord-response.js';

const tempVoiceChannels = new Map();

export function getOwnedTempVoiceChannel(member) {
  const channelId = member.voice.channelId;

  if (!channelId) return null;

  const tempChannel = tempVoiceChannels.get(channelId);

  if (!tempChannel || tempChannel.ownerId !== member.id) {
    return null;
  }

  return member.voice.channel;
}

export async function handleTempVoiceStateUpdate(oldState, newState, config) {
  await handleJoinToCreate(newState);
  await handleTempChannelCleanup(oldState);
}

async function handleJoinToCreate(newState) {
  if (!newState.guild) return;

  const settings = await getGuildSettings(newState.guild.id);
  const tempVoiceChannelId = settings.tempVoiceChannelId;

  if (!tempVoiceChannelId) return;
  if (newState.channelId !== tempVoiceChannelId) return;
  if (!newState.channel) return;

  const member = newState.member;
  const guild = newState.guild;
  const parentId = newState.channel.parentId;
  const channel = await guild.channels.create({
    name: `${member.displayName}'s Room`,
    type: ChannelType.GuildVoice,
    parent: parentId,
  });

  tempVoiceChannels.set(channel.id, {
    ownerId: member.id,
    guildId: guild.id,
  });

  await member.voice.setChannel(channel);
}

async function handleTempChannelCleanup(oldState) {
  if (!oldState.channelId) return;
  if (!tempVoiceChannels.has(oldState.channelId)) return;
  if (!oldState.channel) return;
  if (oldState.channel.members.size > 0) return;

  if (!oldState.channel.deletable) {
    return;
  }

  try {
    await oldState.channel.delete('Temporary voice channel is empty.');
    tempVoiceChannels.delete(oldState.channelId);
  } catch (error) {
    if (isAccessError(error)) {
      return;
    }

    throw error;
  }
}
