import { Client, ApplicationCommand } from "discord.js";
import "dotenv/config";
import getLocalCommands from "../../utils/getLocalCommands";
import getApplicationCommands from "../../utils/getApplicationCommands";
import areCommandsDifferent from "../../utils/areCommandsDifferent";

export default async function registerCommands(client: Client) {
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

// Commands name should be lowercase and no spaces
// const commands = [
//   {
//     name: "ping",
//     description: "Replies with pong!",
//   },
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
//   {
//     name: "add",
//     description: "Add two numbers",
//     options: [
//       {
//         name: "first",
//         description: "The first number",
//         type: ApplicationCommandOptionType.Number,
//         choices: [
//           {
//             name: "one",
//             value: 1,
//           },
//         ],
//         required: true,
//       },
//       {
//         name: "second",
//         description: "The second number",
//         type: ApplicationCommandOptionType.Number,
//         required: true,
//       },
//     ],
//   },
// ];

// const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

// (async () => {
//   try {
//     console.log("Started refreshing application (/) commands.");
//     await rest.put(
//       Routes.applicationGuildCommands(
//         process.env.CLIENT_ID,
//         process.env.GUILD_ID,
//       ),
//       { body: commands },
//     );

//     console.log("Successfully reloaded application (/) commands.");
//   } catch (error) {
//     console.log("Error: ", error);
//   }
// })();
