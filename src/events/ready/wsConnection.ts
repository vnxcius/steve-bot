import { ServerStatus } from "../../types/index.js";
import getCurrentTimeFormatted from "../../utils/getCurrentTimeFormatted.js";
import getEmoji from "../../utils/getEmoji.js";
import logger from "../../utils/logger.js";
import { Client, TextChannel } from "discord.js";
import WebSocket from "ws";

interface ModChangeEntry {
  name: string;
  time: Date;
  type: "added" | "deleted" | "updated";
}
type WSMsg =
  | { type: "status_update"; payload: { status: ServerStatus } }
  | {
      type: "mod_added" | "mod_deleted" | "mod_updated";
      payload: ModChangeEntry;
    };

export default function wsConnection(client: Client) {
  let retryCount = 0;
  let firstStart = true;

  const accessToken = process.env.ACCESS_TOKEN;
  const apiURL = process.env.API_URL;

  if (!accessToken || !apiURL) {
    throw new Error("no access token or api url found");
  }

  const wsURL = apiURL.replace(/^http/, "ws") + "/api/v2/ws";

  const ws = new WebSocket(wsURL, {
    headers: {
      "X-Bot-Token": accessToken,
    },
  });

  ws.on("open", () => {
    logger.Info("WebSocket connection established ✅");
    retryCount = 0;
  });

  ws.on("message", (data) => {
    const channelId = process.env.UPDATES_CHANNEL_ID;
    if (!channelId) return;

    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (!channel) return;

    const time = getCurrentTimeFormatted();

    try {
      const msg = JSON.parse(data.toString()) as WSMsg;

      if (msg.type === "status_update") {
        const status = msg.payload.status;
        logger.Info(`Updated server status to: ${status}`);
        if (firstStart) return;

        const emoji = getEmoji(status);
        const message = `${time} STATUS DO SERVIDOR: ${status.toUpperCase()} ${emoji}`;

        channel.send("`" + message + "`");

        if (firstStart) firstStart = false;
      }

      if (msg.type === "mod_added") {
        logger.Info(`Added mod: ${msg.payload.name}`);

        const message = `✅| ${msg.payload.name} FOI ADICIONADO`;

        channel.send("`" + message + "`");
      }

      if (msg.type === "mod_deleted") {
        logger.Info(`Deleted mod: ${msg.payload.name}`);

        const message = `🗑️| ${msg.payload.name} FOI REMOVIDO`;

        channel.send("`" + message + "`");
      }

      if (msg.type === "mod_updated") {
        logger.Info(`Updated mod: ${msg.payload.name}`);

        const message = `✨| ${msg.payload.name} FOI ATUALIZADO`;

        channel.send("`" + message + "`");
      }
    } catch (error) {
      logger.Error("Failed to parse WebSocket message:", {
        raw: data.toString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  ws.on("error", (err) => {
    logger.Error(`WebSocket error: ${err.message}`);
  });

  ws.on("close", () => {
    const maxDelay = 60 * 60 * 1000;
    const baseDelay = 5000;
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);

    logger.Warn(`WebSocket closed. Reconnecting in ${delay / 1000}s...`);
    firstStart = true;

    setTimeout(() => {
      retryCount++;
      wsConnection(client);
    }, delay);
  });
}
