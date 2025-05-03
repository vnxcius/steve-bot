import { Client, TextChannel } from "discord.js";
import getStatusEmoji from "./getEmoji";
import getCurrentTimeFormatted from "./getCurrentTimeFormatted";
import { ServerStatus } from "@/types";

export default function updateStatus(client: Client, status: ServerStatus) {
  const channelId = process.env.STATUS_CHANNEL_ID;
  if (!channelId) return;

  const channel = client.channels.cache.get(channelId) as TextChannel;
  if (!channel) return;

  const emoji = getStatusEmoji(status);
  const time = getCurrentTimeFormatted();
  const message = `${time} STATUS DO SERVIDOR: ${status.toUpperCase()} ${emoji}`;

  console.log(emoji);
  channel.send("`" + message + "`");
}
