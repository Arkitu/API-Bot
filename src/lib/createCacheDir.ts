import { existsSync } from "fs";
import { mkdir } from "fs/promises";

const cacheModel = [
  "nasa:apod",
  "trefle",
  "trefle/search",
  "trefle/images",
  "video",
  "video/pannel",
  "video/pannel/videos",
  "video/pannel/frames",
  "video/pannel/images",
];

export default async function createCacheDir() {
  if (!existsSync("cache")) {
    await mkdir("cache");
  }
  for (const cacheDir of cacheModel) {
    if (!existsSync(`cache/${cacheDir}`)) {
      await mkdir(`cache/${cacheDir}`);
    }
  }
}