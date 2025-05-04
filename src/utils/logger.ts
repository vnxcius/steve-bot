import chalk from "chalk";
import dayjs from "dayjs";
import fs from "fs-extra";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import getWebhookClient from "../events/ready/webhookClient";

dayjs.extend(utc);
dayjs.extend(timezone);

const appName = "stevebot";
const isDevelopment = process.env.ENVIRONMENT === "development";
const webhookClient = getWebhookClient();

const currentDateFolder = dayjs().tz("America/Sao_Paulo").format("YYYYMMDD"); // Folder: e.g., "20250503"

const currentDate = dayjs().tz("America/Sao_Paulo").format("YYYYMMDD"); // Used in the file name

const currentTime = dayjs().tz("America/Sao_Paulo").format("HHmmssSSS"); // Time with milliseconds, e.g., "183603055"

const logDirRoot = "logs";
const datedLogDir = `${logDirRoot}/${currentDateFolder}`;

fs.ensureDirSync(datedLogDir);

const logFile = `${datedLogDir}/${appName}_${currentDate}_${currentTime}.log`;

function getTimestamp() {
  return dayjs().tz("America/Sao_Paulo").format("HH:mm:ss.SSS");
}

function writeToFile(level: string, message: string) {
  const logMessage = `${getTimestamp()} ${level.toUpperCase()} ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message}\n${error.stack ?? ""}`;
  }
  return String(error);
}

function formatMessage(...args: unknown[]): string {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return formatErrorMessage(arg); // Handle errors specifically
      }

      if (arg === null || arg === undefined) {
        return String(arg);
      }

      if (Array.isArray(arg)) {
        return JSON.stringify(arg, null, 2); // Pretty-print arrays
      }

      if (typeof arg === "object") {
        return JSON.stringify(arg, null, 2); // Pretty-print objects
      }

      return String(arg);
    })
    .join(" "); // Concatenate all arguments into a single string
}

const logger = {
  Info(...args: unknown[]) {
    const message = formatMessage(...args);
    const line = `${getTimestamp()} ${chalk.gray("INFO")} ${message}`;
    console.log(line);
    writeToFile("INFO", message);
    if (webhookClient) webhookClient.send(message);
  },

  Warn(...args: unknown[]) {
    const message = formatMessage(...args);
    const line = `${getTimestamp()} ${chalk.yellow("WARN")} ${message}`;
    console.warn(line);
    writeToFile("WARN", message);
    if (webhookClient) webhookClient.send(message);
  },

  Error(...args: unknown[]) {
    const message = formatMessage(...args);
    const line = `${getTimestamp()} ${chalk.red("ERROR")} ${message}`;
    console.error(line);
    writeToFile("ERROR", message);
    if (webhookClient) webhookClient.send(message);
  },

  Debug(...args: unknown[]) {
    if (isDevelopment) {
      const message = formatMessage(...args);
      const line = `${getTimestamp()} ${chalk.cyan("DEBUG")} ${message}`;
      console.debug(line);
      writeToFile("DEBUG", message);
    }
  },
};

export default logger;
