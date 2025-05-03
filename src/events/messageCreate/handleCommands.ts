import getCurrentServerStatus from "@/utils/getCurrentStatus";
import { Client, Message, TextChannel } from "discord.js";

const prefix = "!";

export default async function handleCommands(client: Client, message: Message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (message.channel instanceof TextChannel) {
    switch (command) {
      case "help":
        message.channel.send("Utilize /help");
        break;
      case "status": {
        const thinking = await message.channel.send("⏳ Fetching status...");
        const { statusMessage, code } = await getCurrentServerStatus();
        if (code !== 200) {
          thinking.edit({
            content: `Falha ao verificar status.`,
          });
          return;
        }
        thinking.edit("`" + statusMessage + "`");
        break;
      }
      case "ping":
        message.channel.send("Pong!");
        break;
      case "echo":
        if (args.length <= 0) {
          message.channel.send("Forneça um texto para repetir.");
          return;
        }
        message.channel.send(args.join(" "));
        break;
      default:
        break;
    }
  } else {
    message.reply("Este comando só pode ser utilizado em um canal de texto.");
  }
}
