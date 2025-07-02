import { Client, ApplicationCommand } from "discord.js";
import getLocalCommands from "../../utils/getLocalCommands.js";
import getApplicationCommands from "../../utils/getApplicationCommands.js";
import areCommandsDifferent from "../../utils/areCommandsDifferent.js";
import deleteAllCommands from "../../utils/deleteAllCommands.js";
import logger from "../../utils/logger.js";
import "dotenv/config";

export default async function registerCommands(client: Client) {
  await deleteAllCommands();
  try {
    const localCommands = await getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      process.env.TEST_GUILD_ID || "",
    );

    for (const command of localCommands) {
      const { name, description, options } = command;
      const existingCommand = applicationCommands.cache.find(
        (cmd: ApplicationCommand) => cmd.name === name,
      );

      if (existingCommand) {
        if (command.deleted) {
          await applicationCommands.delete(existingCommand.id);
          logger.Info(`Deleted command ${name}`);
          return;
        }

        if (areCommandsDifferent(existingCommand, command)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });
          logger.Info(`Updated command ${name}`);
        }
      } else {
        if (command.deleted) {
          logger.Info(`Command ${name} is deleted, skipping...`);
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });
        logger.Info(`Created command ${name}`);
      }
    }
  } catch (error) {
    logger.Error(`Error registering commands: ${error}`, error);
  }
}
