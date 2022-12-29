import { Events } from "discord.js";
import { showFile } from "../commands/github/create_view.js";

const listener: InteractionListener = {
  type: Events.InteractionCreate,
  run: async (interaction) => {
    if (!interaction.isButton()) return;
    switch (interaction.customId) {
      case "github:create_view:refresh":
        await interaction.deferUpdate();
        const url = interaction.message.content.slice(23).split("\n")[0];
        await showFile(interaction, url);
    }
  }
}

export default listener;
