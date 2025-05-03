import { Client, ChatInputCommandInteraction } from "discord.js";
import { Command } from "@/types";
import getCurrentServerStatus from "@/utils/getCurrentStatus";

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
      const status = await getCurrentServerStatus();

      if (!status) {
        interaction.editReply({
          content: `Falha ao verificar status.`,
        });
        return;
      }

      interaction.editReply({
        content: "`" + status + "`",
      });
    },
  };
}
