import { Client, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types";
import getCurrentServerStatus from "../../utils/getCurrentServerStatus.js";
import logger from "../../utils/logger.js";

export default function status(): Command {
  return {
    name: "status",
    description: "Cheque o status atual do servidor",
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      await interaction.deferReply();

      try {
        const { statusMessage, code } = await getCurrentServerStatus();
        logger.Info("Got server status:", statusMessage);

        if (statusMessage === undefined) {
          logger.Error(
            "Failed to get server status from slash command.",
            "status code:",
            code,
          );
          interaction.followUp({
            content: `Falha ao verificar status.`,
          });
          return;
        }

        interaction.followUp({
          content: "`" + statusMessage + "`",
        });
      } catch (error) {
        logger.Error("Failed to get server status from slash command.", error);
        interaction.followUp({
          content: `ERRO INTERNO. Falha ao verificar status.`,
        });
        return;
      }
    },
  };
}
