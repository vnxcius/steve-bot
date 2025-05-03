import {
  ApplicationCommandManager,
  Client,
  GuildApplicationCommandManager,
} from "discord.js";

export default async function getApplicationCommands(
  client: Client,
  guildId: string,
): Promise<GuildApplicationCommandManager | ApplicationCommandManager> {
  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    await guild.commands.fetch();
    return guild.commands;
  }

  const commands = client.application?.commands;
  await commands?.fetch();
  return commands!;
}
