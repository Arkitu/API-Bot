import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { CommandFile } from "../types/command";

const typesWithTo = ["essex", "london", "ity", "linus", "bag", "bowl", "shakespeare", "you", "chainsaw", "eat", "king", "lawn", "off", "donut"];
const typesWithoutTo = ["pink", "given", "everyone", "thanks", "everything", "life", "that", "this"];

const command: CommandFile = {
  admin: false,
  data: new SlashCommandBuilder()
    .setName("foaas")
    .setDescription("Fuck Off As A Service API (https://foass.1001010.com)")
    .setDescriptionLocalization("fr", "L'API de Fuck Off As A Service (https://foass.1001010.com)")
    .addStringOption(opt=>
      opt.setName("type")
        .setDescription("The type of insult (default: \"off\") (see https://foass.1001010.com)")
        .setDescriptionLocalization("fr", "Le type d'insulte (défaut: \"off\") (voir https://foass.1001010.com)")
        .setRequired(false)
        .addChoices(...typesWithTo.concat(typesWithoutTo).map(type=>{ return { name: type, value: type }}))
    )
    .addUserOption(opt=>
      opt.setName("to")
        .setNameLocalization("fr", "à")
        .setDescription("The person that you want to insult (default: \"you\")")
        .setDescriptionLocalization("fr", "La personne que vous voulez insulter (défaut: \"you\")")
        .setRequired(false)
    ),
  run: async (cmd) => {
    await cmd.deferReply();
    const opts = {
      to: cmd.options.getUser("to") || "you",
      type: cmd.options.getString("type") || "off"
    };
    let url = "";
    if (typesWithTo.includes(opts.type)) {
      url = `https://foass.1001010.com/${opts.type}/${opts.to.username}/${cmd.user.username}`;
    } else if (typesWithoutTo.includes(opts.type)) {
      url = `https://foass.1001010.com/${opts.type}/${cmd.user.username}`;
    } else {
      cmd.editReply(":warning: Invalid type !");
      return;
    }
    const fetched = (await axios.get(url, {
      headers: {
        "Accept": "application/json"
      }
    })).data as { message: string, subtitle: string };
    cmd.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(decodeURI(fetched.message))
          .setFooter({ text : `--${decodeURI(fetched.subtitle)}`, iconURL: cmd.user.avatarURL()})
      ]
    });
  }
}

export default command;