import chalk from "chalk";
import dayjs from "dayjs";
import fs from "fs-extra";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import * as path from "path";

dayjs.extend(utc);
dayjs.extend(timezone);

const appName = "stevebot";
const isDevelopment = process.env.DEBUG === "true";

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
  try {
    fs.ensureDirSync(path.dirname(logFile));
    fs.appendFileSync(logFile, logMessage);
  } catch (err) {
    console.error("Failed to write log to file:", err);
    console.error("Original log message:", logMessage);
  }
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
  },

  Warn(...args: unknown[]) {
    const message = formatMessage(...args);
    const line = `${getTimestamp()} ${chalk.yellow("WARN")} ${message}`;
    console.warn(line);
    writeToFile("WARN", message);
  },

  Error(...args: unknown[]) {
    const message = formatMessage(...args);
    const line = `${getTimestamp()} ${chalk.red("ERROR")} ${message}`;
    console.error(line);
    writeToFile("ERROR", message);
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
