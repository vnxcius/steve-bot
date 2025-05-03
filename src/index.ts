import { Client, IntentsBitField } from "discord.js";
import "dotenv/config";
import eventHandler from "./handlers/eventHandler.js";

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
