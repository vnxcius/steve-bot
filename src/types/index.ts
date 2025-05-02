import {
  ApplicationCommandOptionData,
  Client,
  CommandInteraction,
  PermissionResolvable,
} from "discord.js";

export interface Command {
  name: string;
  description: string;
  deleted?: boolean;
  devOnly?: boolean;
  options?: ApplicationCommandOptionData[];
  permissionsRequired?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  callback: (client: Client, interaction: CommandInteraction) => void;
}
