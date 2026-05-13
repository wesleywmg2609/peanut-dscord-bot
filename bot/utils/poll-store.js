import { query } from './database.js';

/**
 * @typedef {Object} Poll
 * @property {string} question
 * @property {string} creatorId
 * @property {number} createdAt
 * @property {Record<string, string>} votes
 */

/**
 * @typedef {Omit<Poll, 'votes'> & { votes: string }} PollRow
 */

/**
 * @param {string} pollId
 * @param {Poll} poll
 * @returns {Promise<Poll>}
 */
export async function createPoll(pollId, poll) {
  await query(
    `
      INSERT INTO polls (id, question, creator_id, created_at, votes)
      VALUES ($1, $2, $3, $4, $5::jsonb)
    `,
    [
      pollId,
      poll.question,
      poll.creatorId,
      poll.createdAt,
      JSON.stringify(poll.votes),
    ],
  );

  return poll;
}

/**
 * @param {string} pollId
 * @returns {Promise<Poll | null>}
 */
export async function getPoll(pollId) {
  const result = await query(
    `
      SELECT
        question,
        creator_id AS "creatorId",
        created_at AS "createdAt",
        votes
      FROM polls
      WHERE id = $1
    `,
    [pollId],
  );
  const poll = /** @type {PollRow | undefined} */ (result.rows[0]);

  if (!poll) {
    return null;
  }

  return {
    ...poll,
    createdAt: Number(poll.createdAt),
    votes: typeof poll.votes === 'string' ? JSON.parse(poll.votes) : poll.votes,
  };
}

/**
 * @param {string} pollId
 * @param {(poll: Poll) => Poll} update
 * @returns {Promise<Poll | null>}
 */
export async function updatePoll(pollId, update) {
  const poll = await getPoll(pollId);

  if (!poll) {
    return null;
  }

  const updatedPoll = update(poll);

  await query(
    `
      UPDATE polls
      SET
        question = $1,
        creator_id = $2,
        created_at = $3,
        votes = $4::jsonb
      WHERE id = $5
    `,
    [
      updatedPoll.question,
      updatedPoll.creatorId,
      updatedPoll.createdAt,
      JSON.stringify(updatedPoll.votes),
      pollId,
    ],
  );

  return updatedPoll;
}
