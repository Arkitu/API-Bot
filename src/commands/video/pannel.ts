import { SubcommandFile } from "../../types/command";
import ffmpeg from "ffmpeg";
import fluentFfmpeg from "fluent-ffmpeg";
import download from "download";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { createWriteStream, existsSync } from "fs";
import { getAverageColor } from 'fast-average-color-node';
import { createCanvas } from "canvas";
import sha1 from "sha1";
import ytdl from 'ytdl-core';

// IMPORTANT: If there is a problem, try to change the `frames` variable name (it's maybe a reserved word)

async function downloadRawVideo(videoLink: string): Promise<string> {
  const videoCacheDir = "./cache/video/pannel/videos";
  const videoFileName = sha1(videoLink) + "." + videoLink.split(".").pop();
  const videoPath = videoCacheDir + "/" + videoFileName;

  // Download the video
  if (!existsSync(videoPath)) {
    console.log("Downloading video : " + videoLink)
    try {
      await download(videoLink, videoCacheDir, { filename: videoFileName });
    } catch (error) {
      console.error(error);
      throw new Error("An error occured while downloading the video");
    }
  }
  return videoPath;
}

async function downloadYoutubeVideo(videoLink: string): Promise<string> {
  const videoPath = "./cache/video/pannel/videos/" + sha1(videoLink) + ".mp4";
  ytdl(videoLink, { quality: "lowest" })
    .pipe(createWriteStream(videoPath), { end: true })
  return videoPath;
}

async function extractFramesFromVideo(framesNbr:number, framesPath:string, videoPath:string): Promise<string[]> {
  let frames: string[] = [];
  if (!existsSync(framesPath)) {
    await mkdir(framesPath, { recursive: true });
    /* ffmpeg version
    try {
      let video = await (new ffmpeg(videoPath));
      console.debug(Math.min(video.metadata.duration.seconds, framesNbr))
      frames = await video.fnExtractFrameToJPG(framesPath, {
        every_n_percentage: 100/Math.min(video.metadata.duration.seconds, framesNbr),
        file_name: `frame_%i`,
      });
    } catch (error) {
      console.error(error)
      throw new Error("An error occured while extracting frames from the video");
    }
    */
    // fluent-ffmpeg version
    console.debug(videoPath)
    await new Promise<void>((resolve, reject) => {
    fluentFfmpeg(videoPath)
      .on("end", () => {
        console.log("Frames extracted");
        resolve()
      })
      .on("error", (error) => {
        console.error(error);
        throw new Error("An error occured while extracting frames from the video");
      })
      .screenshots({
        count: framesNbr,
        folder: framesPath,
        filename: "%i.png"
      });
    })
  }
  
  frames = (await readdir(framesPath)).map((file) => framesPath + file);

  if (!frames.length) {
    console.error("An error occured while extracting frames from the video (colors.length = 0)")
    throw new Error("An error occured while extracting frames from the video");
  }
  while (frames.length < framesNbr) {
    const randomFrameIndex = Math.round(Math.random()*frames.length)
    frames.splice(randomFrameIndex, 0, frames[randomFrameIndex]);
  }
  return frames;
}

async function createPannelImage(frames: string[], height: number, videoLink: string): Promise<Buffer> {
  if (existsSync(`./cache/video/pannel/images/${sha1(videoLink)}/${height}.png`)) {
    return await readFile(`./cache/video/pannel/images/${sha1(videoLink)}/${height}.png`);
  }
  const canvas = createCanvas(frames.length, height);
  const ctx = canvas.getContext("2d");
  for (const i in frames) {
    ctx.fillStyle = (await getAverageColor(frames[i])).hex
    ctx.fillRect(parseInt(i), 0, 1, height);
  }
  await mkdir(`./cache/video/pannel/images/${sha1(videoLink)}/`, { recursive: true });
  writeFile(`./cache/video/pannel/images/${sha1(videoLink)}/${height}.png`, canvas.toBuffer("image/png"));
  return canvas.toBuffer("image/png");
}

const command: SubcommandFile = {
  data: (subcommandGroup)=>subcommandGroup
    .setName("pannel")
    .setNameLocalization("fr", "pannel")
    .setDescription("Create a pannel from a video")
    .setDescriptionLocalization("fr", "Créer un pannel à partir d'une vidéo")
    .addStringOption((option) =>
      option
        .setName("link")
        .setNameLocalization("fr", "lien")
        .setDescription("The link to the video (default: rickroll)")
        .setDescriptionLocalization("fr", "Le lien vers la vidéo (par défaut: rickroll)")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("width")
        .setNameLocalization("fr", "largeur")
        .setDescription(`The width of the image (default: ${constants.getData("/videoPannel/defaultWidth")}})`)
        .setDescriptionLocalization("fr", `La largeur de l'image (par défaut: ${constants.getData("/videoPannel/defaultWidth")}})`)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("height")
        .setNameLocalization("fr", "hauteur")
        .setDescription(`The height of the image (default: ${constants.getData("/videoPannel/defaultHeight")}})`)
        .setDescriptionLocalization("fr", `La hauteur de l'image (par défaut: ${constants.getData("/videoPannel/defaultHeight")}})`)
        .setRequired(false)
    ),
  run: async (cmd) => {
    await cmd.deferReply();
    let replyContent = "";

    const opts = {
      link: cmd.options.getString("link", false) || "https://archive.org/download/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4",
      width: cmd.options.getInteger("width", false) || constants.getData("/videoPannel/defaultWidth"),
      height: cmd.options.getInteger("height", false) || constants.getData("/videoPannel/defaultHeight")
    }

    const framesPath = `./cache/video/pannel/frames/${sha1(opts.link)}/${opts.width}/`;

    // Download the video
    let videoPath: string;
    replyContent += "Downloading video 🔄"
    await cmd.editReply(replyContent)
    try {
      if (["www.youtube.com", "youtube.com", "youtu.be"].includes(new URL(opts.link).hostname)) {
        videoPath = await downloadYoutubeVideo(opts.link);
      } else {
        videoPath = await downloadRawVideo(opts.link);
      }
    } catch (error) {
      await cmd.editReply(replyContent + "\n" + error.message);
      return;
    }

    // Extract frames from the video
    replyContent = "Downloading video ✅\nExtracting frames 🔄"
    await cmd.editReply(replyContent)
    console.log("Extracting frames from video : " + opts.link)
    let frames: string[];
    try {
      frames = await extractFramesFromVideo(opts.width, framesPath, videoPath);
    } catch (error) {
      cmd.editReply(replyContent + "\n" + error.message);
      return;
    }

    // Create the pannel image
    replyContent = "Downloading video ✅\nExtracting frames ✅\nCreating pannel image 🔄"
    await cmd.editReply(replyContent)
    console.log("Creating pannel image : " + opts.link)
    let canvas: Buffer;
    try {
      canvas = await createPannelImage(frames, opts.height, opts.link);
    } catch (error) {
      console.error(error);
      await cmd.editReply(replyContent + "\n" + error.message);
      return;
    }

    // Send the image
    await cmd.editReply({
      content: "Downloading video ✅\nExtracting frames ✅\nCreating pannel image ✅\n\nHere is your pannel image :",
      files: [{ attachment: canvas, name: 'pannel.png' }]
    });
  }
}

export default command