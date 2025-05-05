import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../types";
import logger from "../../utils/logger.js";
import mcs from "node-mcstatus";

export default function serverInfo(): Command {
  return {
    name: "serverinfo",
    description: "Ver informações atuais de um servidor",
    options: [
      {
        name: "ip",
        description: "IP do servidor",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      await interaction.deferReply();

      logger.Info("Trying to get server info");

      const ip = interaction.options.getString("ip");
      if (!ip) {
        logger.Error("Failed to get server ip");
        return interaction.followUp("Por favor, forneça o IP corretamente");
      }

      await mcs
        .statusJava(ip)
        .then((res) => {
          const embed = new EmbedBuilder()
            .setColor(0x52a535)
            .setTitle("Informações do servidor")
            .setDescription(res.host)
            .addFields({
              name: "Status",
              value: res.online ? "Online" : "Offline",
            })
            .setTimestamp();
          if (res.players && res.version && res.motd) {
            const playersList = res.players?.list.map(
              (player) => player.name_clean,
            );
            embed
              .setFooter({ text: res.motd.clean })
              .addFields({
                name: "Jogadores",
                value: res.players.online.toString(),
                inline: true,
              })
              .addFields({
                name: "Máximo de jogadores",
                value: res.players.max.toString(),
                inline: true,
              })
              .addFields({
                name: "Online Agora",
                value: playersList.join(", "),
              })
              .addFields({
                name: "Versão",
                value: res.version.name_clean,
              });
          }

          return interaction.followUp({ embeds: [embed] });
        })
        .catch((error) => {
          if (error instanceof Error) {
            logger.Error(error);
            return interaction.followUp({
              content: error.name + ": " + error.message,
            });
          }

          logger.Error(error);
          return interaction.followUp({
            content: "Ocorreu um erro ao executar o comando",
          });
        });
    },
  };
}
