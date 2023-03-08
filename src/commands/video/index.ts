import { SlashCommandBuilder } from "discord.js";
import { CommandGroupIndexFile } from "../../types/command";

const command: CommandGroupIndexFile = {
  admin: false,
  data: new SlashCommandBuilder()
    .setName("video")
    .setDescription("Video utilities (not really utile)")
    .setDescriptionLocalization("fr", "Utilitaires vidéo (pas vraiment utiles)")
}

export default command;