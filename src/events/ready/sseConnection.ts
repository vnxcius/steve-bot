import updateStatus from "@/utils/updateStatus";
import { Client } from "discord.js";
import { EventSource } from "eventsource";

let retryCount = 0;

export default function sseConnection(client: Client) {
  const accessToken = process.env.ACCESS_TOKEN;
  const apiURL = process.env.API_URL;

  if (!accessToken || !apiURL) {
    throw new Error("no access token or api url found");
  }

  const eventSource = new EventSource(`${apiURL}/api/v2/server-status-stream`);

  eventSource.onopen = () => {
    console.log("SSE connection established successfully ✅");
    retryCount = 0;
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("SSE Connection: server is", data.status);
      updateStatus(client, data.status);
    } catch (error) {
      console.error("Failed to parse SSE message:", {
        raw: event.data,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  eventSource.onerror = (err) => {
    console.log("SSE connection failed ❌", `Error: ${err.message}`);
    eventSource.close();

    const maxDelay = 60 * 60 * 1000; // 1 hour
    const baseDelay = 5000; // 5 seconds

    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    console.log(`Reconnecting in ${delay / 1000}s...`);

    setTimeout(() => {
      retryCount++;
      sseConnection(client);
    }, delay);
  };
}
