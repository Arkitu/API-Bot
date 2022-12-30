import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { SubcommandFile } from "../../types/command";
import hexToRgb from "../../lib/hexToRgb.js";

const command: SubcommandFile = {
  data: (subcommandGroup)=>subcommandGroup
    .setName("search")
    .setNameLocalization("fr", "recherche")
    .setDescription("Search for a plant")
    .setDescriptionLocalization("fr", "Recherche d'une plante")
    .addStringOption((option) =>
      option
        .setName("query")
        .setNameLocalization("fr", "requête")
        .setDescription("The query to search for")
        .setDescriptionLocalization("fr", "La requête à rechercher")
        .setRequired(true)
    ),
  run: async (cmd) => {
    await cmd.deferReply();
    // url: https://trefle.io/api/v1/plants/search?token=YOUR_TREFLE_TOKEN&q=coconut
    const query = cmd.options.getString("query", true).toLowerCase();

    const cachePath = "./cache/trefle/search/" + query + ".json";
    if (!existsSync(cachePath)) {
      const url = `https://trefle.io/api/v1/plants/search?token=${config.getData("/apiKeys/trefle")}&q=${query}`;
      try {
        const fetched = (await axios.get(url)).data;
        console.log("Caching plant search results for " + query)
        await writeFile(cachePath, JSON.stringify(fetched));
      } catch (e) {
        return cmd.editReply(":warning: An error occured while fetching the data");
      }
    }
    const data = JSON.parse(await readFile(cachePath, "utf-8"));

    const plant = data.data[0];
    if (!plant) return cmd.editReply(":warning: No plant found");

    const imgPath = "./cache/trefle/images/" + plant.id + ".jpg";
    if (!existsSync(imgPath)) {
      try {
        const fetched = (await axios.get(plant.image_url, { responseType: "arraybuffer" })).data;
        console.log("Caching plant image for " + plant.id)
        await writeFile(imgPath, fetched, "binary")
      } catch (e) {
        return cmd.editReply(":warning: An error occured while fetching the image");
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(plant.common_name.toUpperCase())
      .setURL(plant.link)
      .setImage("attachment://image.jpg")
      .addFields([
        {
          name: "Scientific name",
          value: plant.scientific_name,
          inline: true
        },
        {
          name: "Family",
          value: plant.family_common_name + " (" + plant.family + ")",
          inline: true
        },
        {
          name: "Genus",
          value: plant.genus,
          inline: true
        },
        {
          name: "Discovery",
          value: "in " + plant.year + " by " + plant.author,
        }
      ])
      .setColor(hexToRgb(constants.getData("/colors/trefle")));
    await cmd.editReply({ embeds: [embed], files: [new AttachmentBuilder(imgPath).setName("image.jpg")] })
  }
}

export default command;