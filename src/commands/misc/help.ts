import {
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { Command } from "@/types";
import getLocalCommands from "@/utils/getLocalCommands";

export default function help(): Command {
  return {
    name: "help",
    description: "Lists all available commands",
    deleted: false,
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      try {
        const commands = await getLocalCommands();
        const embed = new EmbedBuilder()
          .setTitle("Comandos disponíveis")
          .setDescription(
            "Use /help [comando] para obter ajuda sobre um comando.",
          )
          .setColor(0x52a535);

        for (const command of commands) {
          embed.addFields({
            name: `/${command.name}`,
            value: command.description,
          });
        }

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      } catch (error) {
        console.error("Error in help command:", error);
        await interaction.reply({
          content: "An error occurred while listing commands.",
          flags: MessageFlags.Ephemeral,
        });
      }
    },
  };
}
