import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandFile } from "../types/command";

const command: CommandFile = {
  admin: true,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .setDescriptionLocalization("fr", "Répond avec Pong !"),
  run: (cmd) => {
    cmd.reply("🏓 Pong !");
  }
}

export default command;