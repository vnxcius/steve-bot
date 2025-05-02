import { REST, Routes } from "discord.js";
import "dotenv/config";

export default async function deleteAllCommands() {
  const token = process.env.BOT_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;
  const deleteCommands = process.env.DELETE_COMMANDS_ON_START;

  if (deleteCommands !== "true") return;

  if (!token || !clientId || !guildId) {
    throw new Error("no bot or client/guild id token found");
  }

  const rest = new REST().setToken(token);

  try {
    await rest
      .put(Routes.applicationCommands(clientId), { body: [] })
      .then(() =>
        console.log("Successfully deleted all application commands."),
      );

    await rest
      .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
      .then(() => console.log("Successfully deleted all guild commands."));
  } catch (error) {
    console.log("Error deleting commands: ", error);
  }
}
