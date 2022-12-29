import { SubcommandFile } from "../../types/command";
import axios from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const command: SubcommandFile = {
  data: (subcommandGroup)=>subcommandGroup
    .setName("create_view")
    .setNameLocalization("fr", "créer_vue")
    .setDescription("Create representation of a Github file in a message")
    .setDescriptionLocalization("fr", "Créer une représentation d'un fichier Github dans un message")
    .addStringOption(opt=>
      opt.setName("repo_owner")
        .setNameLocalization("fr", "propriétaire_dépot")
        .setDescription("The owner of the GitHub repository")
        .setDescriptionLocalization("fr", "Le propriétaire du dépôt GitHub")
        .setRequired(true)
    )
    .addStringOption(opt=>
      opt.setName("repo_name")
        .setNameLocalization("fr", "nom_dépot")
        .setDescription("The name of the GitHub repository")
        .setDescriptionLocalization("fr", "Le nom du dépôt GitHub")
        .setRequired(true)
    )
    .addStringOption(opt=>
      opt.setName("path")
        .setNameLocalization("fr", "chemin")
        .setDescription("The path of the file in the GitHub repository")
        .setDescriptionLocalization("fr", "Le chemin du fichier dans le dépôt GitHub")
        .setRequired(true)
    )
    .addStringOption(opt=>
      opt.setName("branch")
        .setNameLocalization("fr", "branche")
        .setDescription("The branch of the GitHub repository (default: \"master\")")
        .setDescriptionLocalization("fr", "La branche du dépôt GitHub (défaut: \"master\")")
        .setRequired(false)
    ),
  run: async (cmd) => {
    await cmd.deferReply();
    let path = cmd.options.getString("path", true);
    if (path.startsWith("/")) path = path.slice(1);
    const opts = {
      repo_owner: cmd.options.getString("repo_owner", true),
      repo_name: cmd.options.getString("repo_name", true),
      branch: cmd.options.getString("branch", false) || "master",
      path: path
    };

    // example url : https://raw.githubusercontent.com/Arkitu/Draftbot-Assistant/master/README.md

    const url = `https://raw.githubusercontent.com/${opts.repo_owner}/${opts.repo_name}/${opts.branch}/${path}`;

    let fileContent: string;
    try {
      fileContent = (await axios.get(url)).data;
    } catch (e) {
      cmd.editReply(":warning: Error while fetching the file");
      return;
    }

    let markdownPrefix = "";

    if (constants.getData("/markdownSupportedColoration").includes(path.split(".").pop())) {
      markdownPrefix = path.split(".").pop() + "\n";
    }

    if (fileContent.length > 1850) {
      cmd.editReply(":warning: The file is too long to be displayed");
      return;
    }

    await cmd.editReply({
      content: "Content of the file at " + url + "\n```" + markdownPrefix + fileContent + "```",
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("github:create_view:refresh")
              .setLabel("Refresh")
              .setStyle(ButtonStyle.Primary)
          )
      ]
    })
  }
}

export default command;