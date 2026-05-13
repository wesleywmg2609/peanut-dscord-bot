import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { createPoll, getPoll, updatePoll } from '../../utils/poll-store.js';
import {
  createErrorEmbed,
  createSuccessEmbed,
} from '../../utils/embed.js';

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Creates a yes or no poll.')
  .addStringOption((option) =>
    option
      .setName('question')
      .setDescription('The poll question.')
      .setRequired(true),
  );

export async function execute(interaction) {
  const question = interaction.options.getString('question', true);
  const pollId = interaction.id;

  await createPoll(pollId, {
    question,
    creatorId: interaction.user.id,
    createdAt: Date.now(),
    votes: {},
  });

  await interaction.reply(await buildPollMessage(pollId));
}

export async function handleButton(interaction) {
  const [, vote, pollId] = interaction.customId.split(':');
  const poll = await getPoll(pollId);

  if (!poll) {
    const embed = createErrorEmbed(
      'Poll Not Found',
      'This poll is no longer active.',
    );

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await updatePoll(pollId, (currentPoll) => {
    return {
      ...currentPoll,
      votes: {
        ...currentPoll.votes,
        [interaction.user.id]: vote,
      },
    };
  });

  await interaction.update(await buildPollMessage(pollId));
}

async function buildPollMessage(pollId) {
  const poll = await getPoll(pollId);
  const yesVotes = countVotes(poll, 'yes');
  const noVotes = countVotes(poll, 'no');
  const totalVotes = yesVotes + noVotes;

  const embed = createSuccessEmbed('Poll', poll.question)
    .addFields(
      {
        name: 'Yes',
        value: yesVotes.toString(),
        inline: true,
      },
      {
        name: 'No',
        value: noVotes.toString(),
        inline: true,
      },
      {
        name: 'Total votes',
        value: totalVotes.toString(),
        inline: true,
      },
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`poll:yes:${pollId}`)
      .setLabel(`Yes (${yesVotes})`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`poll:no:${pollId}`)
      .setLabel(`No (${noVotes})`)
      .setStyle(ButtonStyle.Danger),
  );

  return {
    embeds: [embed],
    components: [row],
  };
}

function countVotes(poll, vote) {
  return Object.values(poll.votes).filter((currentVote) => currentVote === vote)
    .length;
}
