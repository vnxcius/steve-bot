import type { Client } from "discord.js";
import getFiles from "../utils/getFiles.js";
import * as path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function eventHandler(client: Client) {
  const eventFolders = getFiles(path.join(__dirname, "..", "events"), true);

  for (const eventFolder of eventFolders) {
    const eventFiles: string[] = getFiles(eventFolder);
    eventFiles.sort((a, b) => a.localeCompare(b));
    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    logger.Info(`Loading event ${eventName}`);
    client.on(eventName as string, async (arg) => {
      for (const eventFile of eventFiles) {
        const eventModule = await import(pathToFileURL(eventFile).href);

        if (typeof eventModule.default !== "function") {
          throw new Error(`Event handler ${eventName} is not a function`);
        }
        await eventModule.default(client, arg);
      }
    });
  }
}
