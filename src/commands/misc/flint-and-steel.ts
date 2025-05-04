import {
  Client,
  ChatInputCommandInteraction,
  GuildMember,
  VoiceChannel,
} from "discord.js";
import { Command } from "../../types";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { fileURLToPath } from "url";
import * as path from "path";
import logger from "../../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function flintAndSteel(): Command {
  return {
    name: "pedra-e-aco",
    description: "PEDRA E AÇO!",
    deleted: false,
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      try {
        await interaction.deferReply();

        const voiceChannel = (interaction.member as GuildMember).voice
          .channel as VoiceChannel;

        if (voiceChannel) {
          logger.Info("Trying to join voice channel");
          const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          });

          const player = createAudioPlayer();
          const resource = createAudioResource(
            path.join(__dirname, "../../assets/pedra_e_aco-2.mp3"),
          );

          logger.Info("Trying to play FLINT AND STEEL audio");

          connection.subscribe(player);
          player.play(resource);

          await entersState(connection, VoiceConnectionStatus.Ready, 20e3);

          player.on(AudioPlayerStatus.Idle, async () => {
            connection.disconnect();
            logger.Info("Disconnected from voice channel");
          });
        }

        await interaction.followUp("PEDRA E AÇO 🗣️🗣️🪨🪨🪨💯💯🔥🙏🔥🙏");
      } catch (error) {
        logger.Error(error);
        await interaction.followUp("Failed to play audio");
      }
    },
  };
}
