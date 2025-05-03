import { Client, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types";
import getCurrentServerStatus from "../../utils/getCurrentServerStatus.js";
import logger from "../../utils/logger.js";

export default function status(): Command {
  return {
    name: "status",
    description: "Cheque o status atual do servidor",
    deleted: false,
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      await interaction.deferReply();
      const { statusMessage } = await getCurrentServerStatus();
      logger.Info("Got server status", statusMessage);

      if (!statusMessage) {
        logger.Error("Failed to get server status from slash command");
        interaction.followUp({
          content: `Falha ao verificar status.`,
        });
        return;
      }

      interaction.followUp({
        content: "`" + statusMessage + "`",
      });
    },
  };
}
