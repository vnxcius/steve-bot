import { ButtonInteraction, Client, Interaction } from "discord.js";
import getLocalCommands from "../../utils/getLocalCommands";
import * as configJson from "../../../config.json";
import { Config } from "../../types";

const config = configJson as Config;
const { devs } = config;

export default async function handleCommands(
  client: Client,
  interaction: Interaction,
) {
  if (interaction.isChatInputCommand()) {
    const commands = await getLocalCommands();

    try {
      const command = commands.find(
        (cmd) => cmd.name === interaction.commandName,
      );

      if (!command) return;
      if (command.devOnly) {
        if (!devs.includes(interaction.user.id)) {
          return interaction.reply({
            content: "Você não tem permissão para usar este comando.",
            ephemeral: true,
          });
        }
      }

      if (command.permissionsRequired?.length) {
        for (const permission of command.permissionsRequired) {
          if (!interaction.memberPermissions?.has(permission)) {
            return interaction.reply({
              content: "Você não tem permissão para usar este comando.",
              ephemeral: true,
            });
          }
        }
      }

      if (command.botPermissions?.length) {
        for (const permission of command.botPermissions) {
          const bot = interaction.guild?.members.me;
          if (!bot?.permissions.has(permission)) {
            return interaction.reply({
              content: "Eu não tenho permissão para usar este comando.",
              ephemeral: true,
            });
          }
        }
      }

      command.callback(client, interaction);
    } catch (error) {
      console.log("Error running command: ", error);
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "delete_message") {
      // Autodestroy message
      await interaction.message.delete();

      await interaction.deferUpdate();
    }
  }
}
