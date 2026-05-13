import { db } from './database.js';

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
  db.prepare(
    `
      INSERT INTO polls (id, question, creator_id, created_at, votes)
      VALUES (?, ?, ?, ?, ?)
    `,
  ).run(
    pollId,
    poll.question,
    poll.creatorId,
    poll.createdAt,
    JSON.stringify(poll.votes),
  );

  return poll;
}

/**
 * @param {string} pollId
 * @returns {Promise<Poll | null>}
 */
export async function getPoll(pollId) {
  const poll = /** @type {PollRow | undefined} */ (
    db
      .prepare(
        `
          SELECT
            question,
            creator_id AS creatorId,
            created_at AS createdAt,
            votes
          FROM polls
          WHERE id = ?
        `,
      )
      .get(pollId)
  );

  if (!poll) {
    return null;
  }

  return {
    ...poll,
    votes: JSON.parse(poll.votes),
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

  db.prepare(
    `
      UPDATE polls
      SET
        question = ?,
        creator_id = ?,
        created_at = ?,
        votes = ?
      WHERE id = ?
    `,
  ).run(
    updatedPoll.question,
    updatedPoll.creatorId,
    updatedPoll.createdAt,
    JSON.stringify(updatedPoll.votes),
    pollId,
  );

  return updatedPoll;
}
