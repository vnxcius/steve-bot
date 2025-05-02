import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../types";

export default function ban(): Command {
  return {
    name: "ban",
    description: "Banir um safado",
    deleted: true,
    options: [
      {
        name: "user",
        description: "Usuário a ser banido",
        required: true,
        type: ApplicationCommandOptionType.Mentionable,
      },
      {
        name: "reason",
        description: "Razão do banimento",
        required: false,
        type: ApplicationCommandOptionType.String,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],
    callback: (client: Client, interaction: CommandInteraction) => {
      interaction.reply("ban..");
    },
  };
}
