import * as path from "path";
import getFiles from "./getFiles.js";
import { fileURLToPath, pathToFileURL } from "url";
import { Command } from "../types";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function getLocalCommands(
  exceptions: string[] = [],
): Promise<Command[]> {
  let localCommands: Command[] = [];

  const commandsCategories = getFiles(
    path.join(__dirname, "..", "commands"),
    true,
  );

  for (const commandsCategory of commandsCategories) {
    const commandFiles = getFiles(commandsCategory);

    for (const commandFile of commandFiles) {
      const commandModule = await import(pathToFileURL(commandFile).href);
      const command: Command = commandModule.default();
      if (exceptions.includes(command.name)) continue;

      localCommands.push(command);
    }
  }

  logger.Debug("Got local commands", localCommands);
  return localCommands;
}
