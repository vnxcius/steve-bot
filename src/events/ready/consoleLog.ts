import { Client } from "discord.js";

export default function consoleLog(client: Client) {
  if (!client.user) return;
  console.log(`🟢 Logged in as ${client.user.username}!`);
}
