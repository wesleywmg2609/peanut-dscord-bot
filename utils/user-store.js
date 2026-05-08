import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersPath = path.join(__dirname, '..', 'data', 'users.json');

export async function getUser(userId) {
  const users = await readUsers();

  return users[userId] ?? {
    coins: 0,
    lastDaily: null,
  };
}

export async function getUsers() {
  return readUsers();
}

export async function updateUser(userId, update) {
  const users = await readUsers();
  const currentUser = users[userId] ?? {
    coins: 0,
    lastDaily: null,
  };

  users[userId] = update(currentUser);

  await writeUsers(users);

  return users[userId];
}

async function readUsers() {
  try {
    const data = await readFile(usersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function writeUsers(users) {
  await mkdir(path.dirname(usersPath), { recursive: true });
  await writeFile(usersPath, `${JSON.stringify(users, null, 2)}\n`);
}
