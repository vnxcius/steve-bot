import {
  ApplicationCommandManager,
  Client,
  GuildApplicationCommandManager,
} from "discord.js";
import logger from "./logger.js";

export default async function getApplicationCommands(
  client: Client,
  guildId: string,
): Promise<GuildApplicationCommandManager | ApplicationCommandManager> {
  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    await guild.commands.fetch();
    logger.Debug("Fetched guild commands");
    return guild.commands;
  }

  const commands = client.application?.commands;
  await commands?.fetch();
  logger.Debug("Fetched global commands");
  return commands!;
}
