import getCurrentServerStatus from "../../utils/getCurrentServerStatus.js";
import { Client, Message, TextChannel } from "discord.js";
import logger from "../../utils/logger.js";

const prefix = "!";

export default async function handleCommands(client: Client, message: Message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (message.channel instanceof TextChannel) {
    switch (command) {
      case "help":
        logger.Info("Sent help from prefix command");
        message.channel.send("Utilize /help");
        break;
      case "status": {
        const thinking = await message.channel.send("⏳ Fetching status...");
        const { statusMessage, code } = await getCurrentServerStatus();

        if (code !== 200) {
          logger.Error("Failed to get server status from prefix command", code);
          thinking.edit({
            content: `Falha ao verificar status.`,
          });
          return;
        }

        logger.Info("Got server status from prefix command", { statusMessage });
        thinking.edit("`" + statusMessage + "`");
        break;
      }
      case "ping":
        logger.Info("Sent pong from prefix command");
        message.channel.send("Pong!");
        break;
      case "echo":
        if (args.length <= 0) {
          message.channel.send("Forneça um texto para repetir.");
          return;
        }
        logger.Info("Sent echo from prefix command");
        message.channel.send(args.join(" "));
        break;
      default:
        break;
    }
  } else {
    logger.Info("Tried to use command in non-text channel");
    message.reply("Este comando só pode ser utilizado em um canal de texto.");
  }
}
