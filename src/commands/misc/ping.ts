import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../types";
import logger from "../../utils/logger.js";

export default function ping(): Command {
  return {
    name: "ping",
    description: "Replies with pong!",
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      await interaction.deferReply();
      try {
        logger.Info("Pinging slash command received");

        const button = new ButtonBuilder()
          .setCustomId("delete_message")
          .setLabel("Delete")
          .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(button);

        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;
        interaction.followUp({
          content: `Pong! Client: ${ping}ms | Websocket: ${client.ws.ping}ms`,
          components: [row.toJSON()],
        });
      } catch (error) {
        logger.Error(error);
        interaction.followUp({
          content: "Ocorreu um erro ao executar o comando",
        });
      }
    },
  };
}
