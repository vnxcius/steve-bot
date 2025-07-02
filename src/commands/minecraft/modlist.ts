import { Client, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types";
import logger from "../../utils/logger.js";
import { request } from "undici";
import { Pagination } from "pagination.djs";

interface Modlist {
  mods: {
    name: string;
  }[];
}

export default function modlist(): Command {
  return {
    name: "modlist",
    description: "Cheque a lista de mods do servidor atual",
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      await interaction.deferReply();
      const apiURL = process.env.API_URL;

      try {
        const res = await request(`${apiURL}/api/v2/modlist`, {
          method: "GET",
        });

        if (res.statusCode !== 200) {
          logger.Error(
            "Failed to get modlist from slash command.",
            res.statusCode,
          );
          interaction.followUp({
            content: "Falha ao verificar modlist.",
          });
          return;
        }
        const data = (await res.body.json()) as Modlist;
        const pagination = new Pagination(interaction, {
          limit: 25,
        });
        pagination.setTitle("ronaldo.vncius.dev - 1.20.1 - Modlist");
        pagination.setThumbnail(
          "https://r2.mcpedl.com/submissions/215138/images/morph-to-copper-golem-asmp_3.png",
        );
        pagination.setColor("#c2410c");
        pagination.setTimestamp();

        pagination.setDescriptions(data.mods.map((mod) => mod.name));
        pagination.render();
      } catch (error) {
        logger.Error("Failed to get modlist from slash command.", error);
        interaction.followUp({
          content: "ERRO INTERNO. Falha ao verificar modlist.",
        });
      }
    },
  };
}
