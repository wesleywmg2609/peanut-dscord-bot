import { deleteReminder, getReminders } from './reminder-store.js';
import { createInfoEmbed } from './embed.js';

const scheduledReminders = new Map();

export function scheduleReminder(client, reminderId, reminder) {
  const delay = reminder.remindAt - Date.now();

  if (scheduledReminders.has(reminderId)) {
    clearTimeout(scheduledReminders.get(reminderId));
  }

  if (delay <= 0) {
    sendReminder(client, reminderId, reminder);
    return;
  }

  const timeout = setTimeout(() => {
    sendReminder(client, reminderId, reminder);
  }, delay);

  scheduledReminders.set(reminderId, timeout);
}

export async function schedulePendingReminders(client) {
  const reminders = await getReminders();

  for (const [reminderId, reminder] of Object.entries(reminders)) {
    scheduleReminder(client, reminderId, reminder);
  }
}

export async function cancelReminder(reminderId) {
  if (scheduledReminders.has(reminderId)) {
    clearTimeout(scheduledReminders.get(reminderId));
    scheduledReminders.delete(reminderId);
  }

  await deleteReminder(reminderId);
}

async function sendReminder(client, reminderId, reminder) {
  scheduledReminders.delete(reminderId);

  try {
    const user = await client.users.fetch(reminder.userId);
    const embed = createInfoEmbed('Reminder', reminder.message)
      .addFields({
        name: 'Set in',
        value: reminder.guildName,
      })
      .setTimestamp();

    await user.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
  } finally {
    await deleteReminder(reminderId);
  }
}
