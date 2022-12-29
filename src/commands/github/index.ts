import { SlashCommandBuilder } from "discord.js";
import { CommandGroupIndexFile } from "../../types/command";

const command: CommandGroupIndexFile = {
  admin: false,
  data: new SlashCommandBuilder()
    .setName("github")
    .setDescription("Github API")
    .setDescriptionLocalization("fr", "L'API de Github")
}

export default command;