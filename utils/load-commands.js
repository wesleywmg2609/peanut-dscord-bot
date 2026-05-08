import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadCommands(commandsPath) {
  const commandFiles = await findCommandFiles(commandsPath);
  const commands = [];

  for (const filePath of commandFiles) {
    const command = await import(pathToFileURL(filePath));
    const category = getCommandCategory(commandsPath, filePath);

    commands.push({
      ...command,
      category,
    });
  }

  return commands;
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
