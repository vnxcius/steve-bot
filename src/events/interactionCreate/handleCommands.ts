import { Client, Interaction, MessageFlags } from "discord.js";
import getLocalCommands from "../../utils/getLocalCommands.js";
import "dotenv/config";
import logger from "../../utils/logger.js";

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
        const authorizedIds = process.env.AUTHORIZED_USER_IDS?.split(",");
        if (!authorizedIds) return;
        if (!authorizedIds.includes(interaction.user.id)) {
          return interaction.reply({
            content: "Você não tem permissão para usar este comando.",
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      if (command.permissionsRequired?.length) {
        for (const permission of command.permissionsRequired) {
          if (!interaction.memberPermissions?.has(permission)) {
            return interaction.reply({
              content: "Você não tem permissão para usar este comando.",
              flags: MessageFlags.Ephemeral,
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
              flags: MessageFlags.Ephemeral,
            });
          }
        }
      }

      command.callback(client, interaction);
    } catch (error) {
      logger.Error(`Error running command: ${error}`);
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
