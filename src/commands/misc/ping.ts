import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "@/types";

export default function ping(): Command {
  return {
    name: "ping",
    description: "Replies with pong!",
    deleted: false,
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      await interaction.deferReply();
      const button = new ButtonBuilder()
        .setCustomId("delete_message")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(button);

      const reply = await interaction.fetchReply();
      const ping = reply.createdTimestamp - interaction.createdTimestamp;
      interaction.editReply({
        content: `Pong! Client: ${ping}ms | Websocket: ${client.ws.ping}ms`,
        components: [row.toJSON()],
      });
    },
  };
}
