import { Client, ApplicationCommand } from "discord.js";
import "dotenv/config";
import getLocalCommands from "@/utils/getLocalCommands";
import getApplicationCommands from "@/utils/getApplicationCommands";
import areCommandsDifferent from "@/utils/areCommandsDifferent";
import deleteAllCommands from "@/utils/deleteAllCommands";

export default async function registerCommands(client: Client) {
  await deleteAllCommands();
  try {
    const localCommands = await getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      process.env.GUILD_ID!,
    );

    for (const command of localCommands) {
      const { name, description, options } = command;
      const existingCommand = applicationCommands.cache.find(
        (cmd: ApplicationCommand) => cmd.name === name,
      );

      if (existingCommand) {
        if (command.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑️ Deleted command ${name}`);
          return;
        }

        if (areCommandsDifferent(existingCommand, command)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });
          console.log(`🔄️ Updated command ${name}`);
        }
      } else {
        if (command.deleted) {
          console.log(`Command ${name} is deleted, skipping...`);
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });
        console.log(`Created command ${name}`);
      }
    }
  } catch (error) {
    console.log("Error: ", error);
  }
}

//   {
//     name: "server-info",
//     description: "Get server info",

//   },
//   {
//     name: "server",
//     description: "Control minecraft server state",
//     options: [
//       {
//         name: "start",
//         description: "Start the server",
//         type: ApplicationCommandOptionType.Subcommand,
//       },
//       {
//         name: "stop",
//         description: "Stop the server",
//         type: ApplicationCommandOptionType.Subcommand,
//       },
//     ],
//   },
// ];
