import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { logError } from '../../utils/bot-logger.js';

const DEFAULT_OLLAMA_BASE_URL = 'http://ollama:11434';
const DEFAULT_OLLAMA_MODEL = 'llama3.2:1b';
const MAX_DISCORD_MESSAGE_LENGTH = 2000;

export const data = new SlashCommandBuilder()
  .setName('ask')
  .setDescription('Ask Peanut a question.')
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('The message to send to Peanut.')
      .setRequired(true)
      .setMaxLength(1000),
  );

export async function execute(interaction) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  });

  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL;
  const ollamaModel = process.env.OLLAMA_MODEL ?? DEFAULT_OLLAMA_MODEL;
  const message = interaction.options.getString('message', true);

  let response;

  try {
    response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: message,
        system:
          'You are Peanut, a helpful Discord bot. Give short, direct answers in 1 to 3 sentences. If the user asks for a recommendation, choose one good option instead of asking many follow-up questions.',
        stream: false,
        options: {
          num_predict: 160,
        },
      }),
    });
  } catch (error) {
    await logError(interaction.client, interaction.guildId, error, '/ask');
    await interaction.editReply({
      content: 'Peanut can\'t do that right now.',
    });
    return;
  }

  if (!response.ok) {
    await handleOllamaError(interaction, response, ollamaBaseUrl, ollamaModel);
    return;
  }

  const result = await response.json();

  const answer = truncateDiscordMessage((result.response ?? '').trim());

  await interaction.editReply({
    content: answer || 'No response generated.',
  });
}

function truncateDiscordMessage(message) {
  if (message.length <= MAX_DISCORD_MESSAGE_LENGTH) {
    return message;
  }

  return `${message.slice(0, MAX_DISCORD_MESSAGE_LENGTH - 3)}...`;
}

async function handleOllamaError(interaction, response, baseUrl, model) {
  const errorText = await response.text();
  const error = new Error(`Ollama returned HTTP ${response.status}: ${errorText}`);
  await logError(interaction.client, interaction.guildId, error, '/ask');

  const message =
    response.status === 404
      ? 'Peanut has not learned how to think yet.'
      : 'Peanut can\'t do that right now.';

  await interaction.editReply({
    content: message,
  });
}
