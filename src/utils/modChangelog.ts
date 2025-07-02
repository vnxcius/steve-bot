import { Client, TextChannel } from "discord.js";
import getCurrentTimeFormatted from "./getCurrentTimeFormatted.js";
import { ServerStatus } from "../types";

export default function modChangelog(
  client: Client,
  payload: { type: string; name: string }[],
  firstStart: boolean,
) {
  if (firstStart) return;
  const channelId = process.env.UPDATES_CHANNEL_ID;
  if (!channelId) return;

  const channel = client.channels.cache.get(channelId) as TextChannel;
  if (!channel) return;

  const time = getCurrentTimeFormatted();
  let message = "";

  for (const change of payload) {
    message += `${time} ${change.type} ${change.name}\n\n`;
  }

  // message = message.trim();

  if (!message) return;

  channel.send("`" + message + "`");
}
