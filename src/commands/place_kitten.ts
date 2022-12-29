import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandFile } from "../types/command";

const command: CommandFile = {
  admin: false,
  data: new SlashCommandBuilder()
    .setName("place_kitten")
    .setDescription("Place kitten API (http://placekitten.com)")
    .setDescriptionLocalization("fr", "L'API de Place kitten (http://placekitten.com)")
    .addIntegerOption(opt=>
      opt.setName("width")
        .setNameLocalization("fr", "largeur")
        .setDescription("The width of the image (default: 500)")
        .setDescriptionLocalization("fr", "La largeur de l'image (défaut: 500)")
        .setRequired(false)
        .setMaxValue(6976)
        .setMinValue(1)
    )
    .addIntegerOption(opt=>
      opt.setName("height")
        .setNameLocalization("fr", "hauteur")
        .setDescription("The height of the image (default: 500)")
        .setDescriptionLocalization("fr", "La hauteur de l'image (défaut: 500)")
        .setRequired(false)
        .setMaxValue(6976)
        .setMinValue(1)
    ),
  run: (cmd) => {
    cmd.reply(`https://placekitten.com/${cmd.options.getInteger("width") || 500}/${cmd.options.getInteger("height") || 500}`);
  }
}

export default command;