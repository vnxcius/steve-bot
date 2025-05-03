import { ServerStatus } from "../types";
import { request } from "undici";
import getStatusEmoji from "./getEmoji.js";
import getCurrentTimeFormatted from "./getCurrentTimeFormatted.js";

interface StatusResponse {
  statusMessage: string;
  code: number;
}

export default async function getCurrentServerStatus(): Promise<StatusResponse> {
  const apiURL = process.env.API_URL;

  const response = await request(`${apiURL}/api/v2/server-status`, {
    method: "GET",
  });

  if (response.statusCode !== 200) {
    return { statusMessage: "", code: response.statusCode };
  }

  const data: any = await response.body.json();
  const status = data.message as ServerStatus;
  const emoji = getStatusEmoji(status);
  const time = getCurrentTimeFormatted();
  const message = `${time} STATUS DO SERVIDOR: ${status.toUpperCase()} ${emoji}`;

  return { statusMessage: message, code: response.statusCode };
}
