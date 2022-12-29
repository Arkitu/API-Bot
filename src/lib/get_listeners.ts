import consoleStamp from "console-stamp";
import { readdir } from "fs/promises";

consoleStamp(console);

export default async function getListeners() {
  let listeners: Listener[] = [];

  // Load Listeners
  for (
    const listenerFileName of
    (await readdir("./build/listeners/"))
        .filter(f=>f.endsWith(".js"))
  ) {
    const listenerFile = (await import(`../listeners/${listenerFileName}`)).default;
    console.log("Loading Listener " + listenerFile.type);

    listeners.push(listenerFile);
  }

  return listeners;
}