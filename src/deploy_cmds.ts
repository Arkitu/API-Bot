import { REST, Routes } from "discord.js";
import getCommands from "./lib/get_commands.js";
import loadConfigAndConstants from "./lib/load_config_and_constants.js";
import consoleStamp from "console-stamp";

consoleStamp(console);

loadConfigAndConstants();

let commands = await getCommands();
console.log("Commands: ", commands);

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(config.getData("/apiKeys/discord") as string);

console.log(`Started refreshing application (/) commands.`);

console.log(`Refreshing admin commands...`);
// Refresh admin commands
await rest.put(
  Routes.applicationGuildCommands(config.getData("/appId"), config.getData("/adminServerId")),
  { body: Object.values(commands)
      .filter(cmd=>cmd.admin)
      .map(cmd=>cmd.data.toJSON()) 
  },
);

console.log(`Refreshing global commands...`);
// Refresh global commands
await rest.put(
  Routes.applicationCommands(config.getData("/appId")),
  { body: Object.values(commands)
      .filter(cmd=>!cmd.admin)
      .map(cmd=>cmd.data.toJSON()) 
  },
);

console.log(`Successfully reloaded application (/) commands.`);