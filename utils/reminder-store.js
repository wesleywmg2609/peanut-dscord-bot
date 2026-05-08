import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const remindersPath = path.join(__dirname, '..', 'data', 'reminders.json');

export async function createReminder(reminderId, reminder) {
  const reminders = await readReminders();

  reminders[reminderId] = reminder;

  await writeReminders(reminders);

  return reminders[reminderId];
}

export async function deleteReminder(reminderId) {
  const reminders = await readReminders();

  delete reminders[reminderId];

  await writeReminders(reminders);
}

export async function getReminders() {
  return readReminders();
}

async function readReminders() {
  try {
    const data = await readFile(remindersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function writeReminders(reminders) {
  await mkdir(path.dirname(remindersPath), { recursive: true });
  await writeFile(remindersPath, `${JSON.stringify(reminders, null, 2)}\n`);
}
