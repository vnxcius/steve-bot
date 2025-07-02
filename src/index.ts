import { Client, IntentsBitField } from "discord.js";
import "dotenv/config";
import eventHandler from "./handlers/eventHandler.js";
import logger from "./utils/logger.js";

process.on("uncaughtException", (err) => {
  logger.Error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  logger.Error("Unhandled Rejection:", reason);
});

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

eventHandler(client);
client.login(process.env.BOT_TOKEN);
