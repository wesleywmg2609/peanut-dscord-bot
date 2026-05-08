import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pollsPath = path.join(__dirname, '..', 'data', 'polls.json');

export async function createPoll(pollId, poll) {
  const polls = await readPolls();

  polls[pollId] = poll;

  await writePolls(polls);

  return polls[pollId];
}

export async function getPoll(pollId) {
  const polls = await readPolls();

  return polls[pollId] ?? null;
}

export async function updatePoll(pollId, update) {
  const polls = await readPolls();
  const poll = polls[pollId];

  if (!poll) {
    return null;
  }

  polls[pollId] = update(poll);

  await writePolls(polls);

  return polls[pollId];
}

async function readPolls() {
  try {
    const data = await readFile(pollsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function writePolls(polls) {
  await mkdir(path.dirname(pollsPath), { recursive: true });
  await writeFile(pollsPath, `${JSON.stringify(polls, null, 2)}\n`);
}
