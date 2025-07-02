import { ServerStatus } from "../types";

export default function getEmoji(status: ServerStatus) {
  switch (status) {
    case "online":
      return "🟢";
    case "starting":
      return "🔵";
    case "offline":
      return "🔴";
    case "stopping":
    case "restarting":
      return "🟡";
    default:
      return "❌";
  }
}
