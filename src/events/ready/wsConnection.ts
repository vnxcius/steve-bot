import { ServerStatus } from "../../types/index.js";
import logger from "../../utils/logger.js";
import updateStatus from "../../utils/updateStatus.js";
import { Client } from "discord.js";
import WebSocket from "ws";

type WSMsg = { type: "status_update"; payload: { status: ServerStatus } };

let retryCount = 0;
let firstStart = true;
let ws: WebSocket | null = null;

export default function wsConnection(client: Client) {
  const accessToken = process.env.ACCESS_TOKEN;
  const apiURL = process.env.API_URL;

  if (!accessToken || !apiURL) {
    throw new Error("no access token or api url found");
  }

  const wsURL = apiURL.replace(/^http/, "ws") + "/api/v2/ws";

  ws = new WebSocket(wsURL, {
    headers: {
      "X-Bot-Token": accessToken,
    },
  });

  ws.on("open", () => {
    logger.Info("WebSocket connection established ✅");
    retryCount = 0;
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString()) as WSMsg;

      if (msg.type === "status_update") {
        logger.Info(`Updated server status to: ${msg.payload.status}`);
        updateStatus(client, msg.payload.status, firstStart);
        if (firstStart) firstStart = false;
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
