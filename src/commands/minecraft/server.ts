import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  MessageFlags,
} from "discord.js";
import { Command } from "../../types";
import { request } from "undici";
import logger from "../../utils/logger.js";

export default function server(): Command {
  return {
    name: "server",
    description: "Controle o servidor de minecraft",
    devOnly: true,
    options: [
      {
        name: "start",
        description: "Iniciar o servidor",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "stop",
        description: "Parar o servidor",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "restart",
        description: "Reiniciar o servidor",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const accessToken = process.env.ACCESS_TOKEN;
      const apiURL = process.env.API_URL;

      if (!accessToken || !apiURL) {
        logger.Error("No access token or API URL environment variable found");
        return;
      }

      const command = interaction.options.getSubcommand();
      try {
        logger.Info("Trying to " + command + " the server");
        let response;

        if (command === "start") {
          response = await request(`${apiURL}/api/v2/signed/server/start`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }

        if (command === "stop") {
          response = await request(`${apiURL}/api/v2/signed/server/stop`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }

        if (command === "restart") {
          response = await request(`${apiURL}/api/v2/signed/server/restart`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }

        if (response?.statusCode !== 200) {
          logger.Error(
            "Failed to " + command + " the server.",
            response?.statusCode,
          );
          interaction.followUp({
            content: `ERRO INTERNO. Falha ao ${command} o servidor.`,
          });
          return;
        }

        const data: any = await response.body.json();

        const message = `${data.message}`;
        interaction.followUp({
          content: "`" + message + " ✅`",
        });

        setTimeout(() => {
          interaction.deleteReply();
        }, 3000);
      } catch (error) {
        logger.Error("Failed to " + command + " the server", error);
        interaction.followUp({
          content: `ERRO INTERNO. Falha ao ${command} o servidor.`,
        });
      }
    },
  };
}
