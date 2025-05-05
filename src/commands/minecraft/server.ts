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
      let response;

      if (!accessToken || !apiURL) {
        logger.Error("No access token or API URL environment variable found");
        return;
      }

      const command = interaction.options.getSubcommand();
      logger.Info("Trying to " + command + " the server");

      if (command === "start") {
        response = await request(`${apiURL}/api/v2/server/start`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      if (command === "stop") {
        response = await request(`${apiURL}/api/v2/server/stop`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      if (command === "restart") {
        response = await request(`${apiURL}/api/v2/server/restart`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      if (response?.statusCode !== 200) {
        logger.Error("Failed to " + command + " the server");
        return;
      }

      const data: any = await response.body.json();

      const message = `${data.message}`;
      interaction.followUp({
        content: "`" + message + " ✅`",
      });
    },
  };
}
