import logger from "@/utils/logger";
import { Client } from "discord.js";

export default function consoleLog(client: Client) {
  if (!client.user) return;
  logger.Info(`Logged in as ${client.user.username}`);
}
