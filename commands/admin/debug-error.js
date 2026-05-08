import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('debug-error')
  .setDescription('Throws a test error for log channel testing.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute() {
  throw new Error('Test log channel error');
}
