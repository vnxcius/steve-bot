import { WebhookClient } from "discord.js";
import logger from "../../utils/logger.js";

let webhookClient: WebhookClient | null = null;

export default function getWebhookClient(): WebhookClient | null {
  if (webhookClient) return webhookClient;

  const webhookURL = process.env.WEBHOOK_URL;
  if (!webhookURL) {
    logger.Warn("No webhook URL found, cannot create webhook client");
    return null;
  }

  webhookClient = new WebhookClient({ url: webhookURL });
  webhookClient.send("Loaded webhook client");

  return webhookClient;
}
