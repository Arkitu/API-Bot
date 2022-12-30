import { SlashCommandBuilder } from "discord.js";
import { CommandGroupIndexFile } from "../../types/command";

const command: CommandGroupIndexFile = {
  admin: false,
  data: new SlashCommandBuilder()
    .setName("trefle")
    .setDescription("Trefle.io API")
    .setDescriptionLocalization("fr", "L'API de Trefle.io")
}

export default command;