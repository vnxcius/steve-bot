import logger from "../../utils/logger.js";
import updateStatus from "../../utils/updateStatus.js";
import { Client } from "discord.js";
import { EventSource } from "eventsource";

let retryCount = 0;
let firstStart = true;

export default function sseConnection(client: Client) {
  const accessToken = process.env.ACCESS_TOKEN;
  const apiURL = process.env.API_URL;

  if (!accessToken || !apiURL) {
    throw new Error("no access token or api url found");
  }

  const eventSource = new EventSource(`${apiURL}/api/v2/server-status-stream`);

  eventSource.onopen = () => {
    logger.Info("SSE connection established successfully ✅");
    retryCount = 0;
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      logger.Info(`Updated server status to: ${data.status}`);
      updateStatus(client, data.status, firstStart);

      if (firstStart) firstStart = false;
    } catch (error) {
      logger.Error("Failed to parse SSE message:", {
        raw: event.data,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  eventSource.onerror = (err) => {
    logger.Error(`SSE connection failed ❌ Error: ${err.message}`);
    eventSource.close();

    const maxDelay = 60 * 60 * 1000; // 1 hour
    const baseDelay = 5000; // 5 seconds

    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    logger.Info(`Reconnecting in ${delay / 1000}s...`);

    firstStart = true;
    setTimeout(() => {
      retryCount++;
      sseConnection(client);
    }, delay);
  };
}
