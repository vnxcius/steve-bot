import { Client, TextChannel } from "discord.js";
import getStatusEmoji from "./getEmoji.js";
import getCurrentTimeFormatted from "./getCurrentTimeFormatted.js";
import { ServerStatus } from "../types";

export default function updateStatus(client: Client, status: ServerStatus) {
  const channelId = process.env.STATUS_CHANNEL_ID;
  if (!channelId) return;

  const channel = client.channels.cache.get(channelId) as TextChannel;
  if (!channel) return;

  const emoji = getStatusEmoji(status);
  const time = getCurrentTimeFormatted();
  const message = `${time} STATUS DO SERVIDOR: ${status.toUpperCase()} ${emoji}`;

  channel.send("`" + message + "`");
}
