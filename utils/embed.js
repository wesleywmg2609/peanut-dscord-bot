import { EmbedBuilder } from 'discord.js';

export function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle(title)
    .setDescription(description);
}

export function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle(title)
    .setDescription(description);
}

export function createInfoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(title)
    .setDescription(description);
}