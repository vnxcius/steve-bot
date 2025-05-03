import * as fs from "fs";
import * as path from "path";
import logger from "./logger.js";

export default (dir: string, foldersOnly: boolean = false) => {
  let fileNames = [];

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (foldersOnly) {
      if (file.isDirectory()) fileNames.push(filePath);
    } else {
      fileNames.push(filePath);
    }
  }

  logger.Debug("Got file names", fileNames);
  return fileNames;
};
