import {
  // ActivityType,
  Client,
  // EmbedBuilder,
  IntentsBitField,
} from "discord.js";
import "dotenv/config";
import eventHandler from "./handlers/eventHandler.js";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

eventHandler(client);

// client.on("interactionCreate", async (interaction) => {
//   if (!interaction.isChatInputCommand()) return;
//   // Makes the bot wait before replying ("thinking")
//   // Needs to be inside a try/catch
//   // await interaction.deferReply();

//   if (interaction.commandName === "ping") {
//     await interaction.reply("Pong!");
//   }

//   if (interaction.commandName === "add") {
//     const first = interaction.options.get("first").value;
//     const second = interaction.options.get("second").value;
//     interaction.reply(`${first} + ${second} = ${first + second}`);
//   }

//   if (interaction.commandName === "server") {
//     const subcommand = interaction.options.getSubcommand();
//     if (subcommand === "start") {
//       interaction.reply("Starting the server... [FAKE]");
//     }
//     if (subcommand === "stop") {
//       interaction.reply("Stopping the server... [FAKE]");
//     }
//   }

//   if (interaction.commandName === "server-info") {
//     const embed = new EmbedBuilder()
//       .setTitle("Server Info")
//       .setDescription("Informações do servidor")
//       .setColor(0x52a535)
//       .setThumbnail("https://i.imgur.com/AfFp7pu.png")
//       .setTimestamp()
//       .addFields(
//         { name: "MOTD", value: "Server MOTD", inline: true },
//         { name: "Version", value: "1.20.1", inline: true },
//         { name: "Players", value: "Players" },
//         { name: "IP", value: "mmfc.vncius.dev" },
//       );

//     interaction.reply({ embeds: [embed] });
//   }
// });

client.login(process.env.BOT_TOKEN);
