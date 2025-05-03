import {
  Client,
  ChatInputCommandInteraction,
  GuildMember,
  VoiceChannel,
} from "discord.js";
import { Command } from "@/types";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function theNether(): Command {
  return {
    name: "o-nether",
    description: "O NETHER!",
    deleted: false,
    callback: async (
      client: Client,
      interaction: ChatInputCommandInteraction,
    ) => {
      await interaction.reply("O NETHER 🗣️🔥🔥🔥🗣️🔥💯💯❌🧢");

      const voiceChannel = (interaction.member as GuildMember).voice
        .channel as VoiceChannel;

      if (!voiceChannel) return;

      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(
          path.join(__dirname, "../../assets/o_nether-2.mp3"),
        );

        connection.subscribe(player);
        player.play(resource);

        await entersState(connection, VoiceConnectionStatus.Ready, 20e3);

        player.on(AudioPlayerStatus.Idle, async () => {
          connection.disconnect();
        });
      } catch (error) {
        console.log(error);
        await interaction.editReply("Failed to play audio");
      }
    },
  };
}
