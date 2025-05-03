import logger from "../../utils/logger.js";
import { Client } from "discord.js";

export default function consoleLog(client: Client) {
  if (!client.user) return;
  logger.Info(`Logged in as ${client.user.username}`);
}
