import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  CommandInteraction,
} from "discord.js";
import { Command } from "../../types";

export default function ping(): Command {
  return {
    name: "ping",
    description: "Replies with poing!",
    deleted: false,
    callback: (client: Client, interaction: CommandInteraction) => {
      const button = new ButtonBuilder()
        .setCustomId("delete_message")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(button);

      interaction.reply({
        content: `Pong! ${client.ws.ping}ms`,
        components: [row.toJSON()],
        withResponse: true,
      });
    },
  };
}
