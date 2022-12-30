import { EmbedBuilder } from "@discordjs/builders";
import axios from "axios";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { SubcommandFile } from "../../types/command";
import hexToRgb from "../../lib/hexToRgb.js";

const command: SubcommandFile = {
  data: (subcommandGroup)=>subcommandGroup
    .setName("apod")
    .setDescription("Astronomy Picture of the Day")
    .setDescriptionLocalization("fr", "Image d'Astronomie du Jour")
    .addStringOption((opt) =>opt
      .setName("date")
      .setDescription("Date of the picture (YYYY-MM-DD) (default: today)")
      .setDescriptionLocalization("fr", "Date de l'image (AAAA-MM-JJ) (par défaut: aujourd'hui)")
    ),
  run: async (cmd) => {
    await cmd.deferReply();
    // url = https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY?date=YYYY-MM-DD
    const date = cmd.options.getString("date", false) || new Date().toISOString().split("T")[0];
    let url = "https://api.nasa.gov/planetary/apod?api_key=" + config.getData("/apiKeys/nasa");
    // Check if date is valid
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      cmd.reply("Invalid date format. Please use YYYY-MM-DD");
      return;
    }
    url += "&date=" + date;
    const cachePath = "./cache/nasa:apod/" + date + ".json";
    if (!existsSync(cachePath)) {
      try {
        console.debug(url)
        const fetched = (await axios.get(url)).data;
        console.log("Caching apod data for date " + date)
        await writeFile(cachePath, JSON.stringify(fetched));
      } catch (err) {
        console.debug(err)
        cmd.reply(":warning: Error while fetching data from NASA API");
        return;
      }
    }
    const data: {
      "copyright":string,
      "date":string,
      "explanation":string,
      "hdurl":string,
      "media_type":string,
      "service_version":string,
      "title":string,
      "url":string
    } = JSON.parse(await readFile(cachePath, "utf-8"));
    const embed = new EmbedBuilder()
      .setTitle(data.title)
      .setURL(data.hdurl)
      .setDescription(data.explanation)
      .setImage(data.url)
      .setFooter({ text: "Date : " + data.date, iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1200px-NASA_logo.svg.png" })
      .setColor(hexToRgb(constants.getData("/colors/nasa")));
    await cmd.editReply({ embeds: [embed] })
  }
}

export default command;