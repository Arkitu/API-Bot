import { SlashCommandBuilder } from "discord.js";
import { CommandGroupIndexFile } from "../../types/command";

const command: CommandGroupIndexFile = {
  admin: false,
  data: new SlashCommandBuilder()
    .setName("nasa")
    .setDescription("Nasa's API")
    .setDescriptionLocalization("fr", "L'API de la Nasa")
}

export default command;