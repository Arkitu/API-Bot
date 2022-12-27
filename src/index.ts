import { Client, GatewayIntentBits, Events, ChatInputCommandInteraction } from "discord.js";
import consoleStamp from "console-stamp";
import getCommands from "./lib/get_commands.js";
import loadConfigAndConstants from "./lib/load_config_and_constants.js";
import { Command, CommandGroup, CommandRunnable, Subcommand, SubcommandGroup } from "./types/command.js";

consoleStamp(console);

var client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

loadConfigAndConstants()

getCommands().then(commands => {
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const cmdPath = [interaction.commandName, interaction.options.getSubcommandGroup(false), interaction.options.getSubcommand(false)].filter(x=>x);
    console.log("User " + interaction.user.id + " use command /" + cmdPath.join(" "));

    let cmd: CommandRunnable;

    switch (cmdPath.length) {
      case 1:
        cmd = commands[cmdPath[0]] as Command;
        break;
      case 2:
        cmd = (commands[cmdPath[0]] as CommandGroup).subCommands[cmdPath[1]] as Subcommand;
        break;
      case 3:
        cmd = ((commands[cmdPath[0]] as CommandGroup).subCommands[cmdPath[1]] as SubcommandGroup).subCommands[cmdPath[2]] as Subcommand;
        break;
    }
    
    if (commands[cmdPath[0]].admin && !config.getData("/adminIds").includes(interaction.user.id)) {
      console.log("User " + interaction.user.id + " tried to use admin command /" + interaction.commandName + " but was denied")
      interaction.reply("You do not have permission to use this command!");
      return
    }
    
    cmd.run(interaction);
  });
});

client.on(Events.ClientReady, () => {
  console.log("Bot is ready!")
});

client.login(config.getData("/token") as string);