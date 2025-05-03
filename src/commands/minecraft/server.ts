import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  MessageFlags,
} from "discord.js";
import { Command } from "../../types";
import { request } from "undici";

export default function server(): Command {
  return {
    name: "server",
    description: "Controle o servidor de minecraft",
    deleted: false,
    devOnly: true,
    options: [
      {
        name: "start",
        description: "Start the server",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "stop",
        description: "Stop the server",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "restart",
        description: "Restart the server",
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
        throw new Error("no access token or api url found");
      }

      let response;

      if (interaction.options.getSubcommand() === "start") {
        response = await request(`${apiURL}/api/v2/server/start`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      if (interaction.options.getSubcommand() === "stop") {
        response = await request(`${apiURL}/api/v2/server/stop`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      if (interaction.options.getSubcommand() === "restart") {
        response = await request(`${apiURL}/api/v2/server/restart`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      if (!response) {
        throw new Error("no valid response from server");
      }

      const data: any = await response.body.json();

      const message = `${data.message}`;
      interaction.editReply({
        content: "`" + message + " ✅`",
      });
    },
  };
}
