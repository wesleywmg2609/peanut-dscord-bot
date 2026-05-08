import { ChannelType, PermissionsBitField } from 'discord.js';

const tempVoiceChannels = new Map();

export async function handleTempVoiceStateUpdate(oldState, newState, config) {
  await handleJoinToCreate(newState, config);
  await handleTempChannelCleanup(oldState);
}

async function handleJoinToCreate(newState, config) {
  if (!config.tempVoiceChannelId) return;
  if (newState.channelId !== config.tempVoiceChannelId) return;
  if (!newState.channel) return;

  const member = newState.member;
  const guild = newState.guild;
  const parentId = newState.channel.parentId;
  const channel = await guild.channels.create({
    name: `${member.displayName}'s Room`,
    type: ChannelType.GuildVoice,
    parent: parentId,
    permissionOverwrites: [
      {
        id: member.id,
        allow: [
          PermissionsBitField.Flags.Connect,
          PermissionsBitField.Flags.ManageChannels,
          PermissionsBitField.Flags.MoveMembers,
        ],
      },
    ],
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

  tempVoiceChannels.delete(oldState.channelId);
  await oldState.channel.delete('Temporary voice channel is empty.');
}
