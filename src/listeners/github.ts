import axios from "axios";
import { BaseInteraction, Events } from "discord.js";

const listener: InteractionListener = {
  type: Events.InteractionCreate,
  run: async (interaction) => {
    if (!interaction.isButton()) return;
    switch (interaction.customId) {
      case "github:create_view:refresh":
        await interaction.deferUpdate();
        const url = interaction.message.content.slice(23).split("\n")[0];
        let fileContent: string;
        try {
          fileContent = (await axios.get(url)).data;
        } catch (e) {
          interaction.editReply(":warning: This file doesn't exist anymore");
          return;
        }
        interaction.editReply({
          content: "Content of the file at " + url + "\n```" + fileContent + "```",
        });
    }
  }
}

export default listener;
