import {
    ActionRowBuilder,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';
import {
    createReminder,
    getReminder,
    getUserReminders,
} from '../../utils/reminder-store.js';
import {
    cancelReminder,
    scheduleReminder,
} from '../../utils/reminder-scheduler.js';

const maxMinutes = 60 * 24 * 7;

export const data = new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Manages your reminders.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Sets a reminder.')
            .addIntegerOption((option) =>
                option
                    .setName('minutes')
                    .setDescription('How many minutes from now to remind you.')
                    .setMinValue(1)
                    .setMaxValue(maxMinutes)
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName('message')
                    .setDescription('What you want to be reminded about.')
                    .setRequired(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('cancel')
            .setDescription('Cancels one of your active reminders.'),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('list')
            .setDescription('Lists your active reminders.'),
    );

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
        await addReminder(interaction);
        return;
    }

    if (subcommand === 'cancel') {
        await showCancelReminderMenu(interaction);
        return;
    }

    if (subcommand === 'list') {
        await listReminders(interaction);
    }
}

async function addReminder(interaction) {
    const minutes = interaction.options.getInteger('minutes', true);
    const message = interaction.options.getString('message', true);
    const reminderTime = minutes * 60 * 1000;
    const remindAt = Date.now() + reminderTime;
    const reminderTimestamp = Math.floor(remindAt / 1000);
    const reminderId = interaction.id;

    const reminder = {
        userId: interaction.user.id,
        guildName: interaction.guild?.name ?? 'Direct Message',
        message,
        remindAt,
        createdAt: Date.now(),
    };

    await createReminder(reminderId, reminder);
    scheduleReminder(interaction.client, reminderId, reminder);

    const confirmationEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('Reminder Set')
        .setDescription(message)
        .addFields({
            name: 'When',
            value: `<t:${reminderTimestamp}:R>`,
        });

    await interaction.reply({
        embeds: [confirmationEmbed],
        flags: MessageFlags.Ephemeral,
    });
}

async function showCancelReminderMenu(interaction) {
    const reminders = await getUserReminders(interaction.user.id);

    if (reminders.length === 0) {
        await interaction.reply({
            content: 'You do not have any active reminders.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const menu = new StringSelectMenuBuilder()
        .setCustomId(`reminder:${interaction.user.id}`)
        .setPlaceholder('Select a reminder to cancel')
        .addOptions(
            reminders.slice(0, 25).map(([reminderId, reminder]) => {
                return {
                    label: truncateText(reminder.message, 100),
                    description: `Due ${formatDate(reminder.remindAt)}`,
                    value: reminderId,
                };
            }),
        );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
        content: 'Select the reminder you want to cancel.',
        components: [row],
        flags: MessageFlags.Ephemeral,
    });
}

async function listReminders(interaction) {
    const reminders = await getUserReminders(interaction.user.id);

    if (reminders.length === 0) {
        await interaction.reply({
            content: 'You do not have any active reminders.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const description = reminders
        .map(([, reminder], index) => {
            const remindAt = Math.floor(reminder.remindAt / 1000);

            return `${index + 1}. ${reminder.message}\nWhen: <t:${remindAt}:R>\nSet in: ${reminder.guildName}`;
        })
        .join('\n\n');

    const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('Active Reminders')
        .setDescription(description);

    await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
    });
}

export async function handleSelectMenu(interaction) {
    const [, userId] = interaction.customId.split(':');

    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: 'This cancellation menu is not for you.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const [reminderId] = interaction.values;
    const reminder = await getReminder(reminderId);

    if (!reminder || reminder.userId !== interaction.user.id) {
        const notFoundEmbed = new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle('Reminder Not Found')
            .setDescription('I could not find that active reminder.');

        await interaction.update({
            content: '',
            embeds: [notFoundEmbed],
            components: [],
        });
        return;
    }

    await cancelReminder(reminderId);

    const cancelledEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('Reminder Cancelled')
        .setDescription(reminder.message);

    await interaction.update({
        content: '',
        embeds: [cancelledEmbed],
        components: [],
    });
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength - 3)}...`;
}

function formatDate(timestamp) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(timestamp);
}