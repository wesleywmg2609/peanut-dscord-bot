import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

const polls = new Map();

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

  polls.set(pollId, {
    question,
    votes: new Map(),
  });

  await interaction.reply(buildPollMessage(pollId));
}

export async function handleButton(interaction) {
  const [, vote, pollId] = interaction.customId.split(':');
  const poll = polls.get(pollId);

  if (!poll) {
    await interaction.reply({
      content: 'This poll is no longer active.',
      ephemeral: true,
    });
    return;
  }

  poll.votes.set(interaction.user.id, vote);

  await interaction.update(buildPollMessage(pollId));
}

function buildPollMessage(pollId) {
  const poll = polls.get(pollId);
  const yesVotes = countVotes(poll, 'yes');
  const noVotes = countVotes(poll, 'no');
  const totalVotes = yesVotes + noVotes;

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('Poll')
    .setDescription(poll.question)
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
  return [...poll.votes.values()].filter((currentVote) => currentVote === vote)
    .length;
}
