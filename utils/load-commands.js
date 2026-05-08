import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadCommands(commandsPath) {
  const commandFiles = await findCommandFiles(commandsPath);
  const commands = [];
  const commandNames = new Set();

  for (const filePath of commandFiles) {
    const command = await import(pathToFileURL(filePath));
    const category = getCommandCategory(commandsPath, filePath);
    const loadedCommand = {
      ...command,
      category,
      filePath,
    };

    validateCommand(loadedCommand);

    if (commandNames.has(loadedCommand.data.name)) {
      throw new Error(
        `Duplicate command name "${loadedCommand.data.name}" in ${filePath}`,
      );
    }

    commandNames.add(loadedCommand.data.name);
    commands.push(loadedCommand);
  }

  return commands.sort((firstCommand, secondCommand) =>
    firstCommand.data.name.localeCompare(secondCommand.data.name),
  );
}

async function findCommandFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const commandFiles = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      commandFiles.push(...(await findCommandFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      commandFiles.push(entryPath);
    }
  }

  return commandFiles;
}

function getCommandCategory(commandsPath, filePath) {
  const [category] = path.relative(commandsPath, filePath).split(path.sep);

  return category.charAt(0).toUpperCase() + category.slice(1);
}

function validateCommand(command) {
  if (!command.data) {
    throw new Error(`Command file is missing "data": ${command.filePath}`);
  }

  if (!command.data.name) {
    throw new Error(`Command file is missing "data.name": ${command.filePath}`);
  }

  if (!command.data.description) {
    throw new Error(
      `Command file is missing "data.description": ${command.filePath}`,
    );
  }

  if (typeof command.execute !== 'function') {
    throw new Error(`Command file is missing "execute": ${command.filePath}`);
  }
}
