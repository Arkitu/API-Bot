import { readdir } from "fs/promises";
import { Command, CommandGroup, Subcommand, SubcommandGroup, SubcommandFile, SubcommandGroupIndexFile } from "../types/command";
import consoleStamp from "console-stamp";
import { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";

consoleStamp(console);

const commandLike = {
  isCommand: false,
  isCommandGroup: false,
  isSubCommandGroup: false,
  isSubCommand: false
};

export default async function getCommands() {
  let commands: { [key:string]: Command | CommandGroup } = {};

  // Load Commands
  for (
    const cmdFileName of
    (await readdir("./build/commands/"))
        .filter(f=>f.endsWith(".js"))
  ) {
    const cmdFile = {
      ...commandLike,
      isCommand: true,
      ...(await import(`../commands/${cmdFileName}`)).default,
    } as Command;
    console.log("Loading /" + cmdFile.data.name);

    commands[cmdFile.data.name] =  cmdFile;
  }

  // Load Command Groups
  for (
    const cmdGroupDirName of
    (await readdir("./build/commands/"))
      .filter(f=>!f.endsWith(".js"))
  ) {
    const cmdGroup = {
      ...commandLike,
      isCommandGroup: true,
      ...(await import(`../commands/${cmdGroupDirName}/index.js`)).default,
      subCommands: {}
    } as CommandGroup;
    console.log("Loading /" + cmdGroup.data.name);

    // Load Subcommands
    for (
      const subcmdFileName of
      (await readdir(`./build/commands/${cmdGroupDirName}/`))
        .filter(f=>f.endsWith(".js") && f != "index.js")
    ) {
      const subcmdFile = (await import(`../commands/${cmdGroupDirName}/${subcmdFileName}`)).default as SubcommandFile;
      const subcmd = {
        ...commandLike,
        isSubCommand: true,
        ...subcmdFile,
        data: subcmdFile.data(new SlashCommandSubcommandBuilder())
      } as Subcommand;
      console.log("Loading /" + cmdGroup.data.name + " " + subcmd.data.name);
      cmdGroup.data.addSubcommand(subcmdFile.data)
      cmdGroup.subCommands[subcmd.data.name] = subcmd;
    }

    // Load Subcommand Groups
    for (
      const subcmdGroupDirName of
      (await readdir(`./build/commands/${cmdGroupDirName}/`))
        .filter(f=>!f.endsWith(".js"))
    ) {
      const subcmdGroupFile = (await import(`../commands/${cmdGroupDirName}/${subcmdGroupDirName}/index.js`)).default as SubcommandGroupIndexFile;
      const subcmdGroup = {
        ...commandLike,
        isSubCommandGroup: true,
        ...subcmdGroupFile,
        data: subcmdGroupFile.data(new SlashCommandSubcommandGroupBuilder()),
        subCommands: {}
      } as SubcommandGroup;
      console.log("Loading /" + cmdGroup.data.name + " " + subcmdGroup.data.name);
      
      // Load Subcommands
      for (
        const subcmdFileName of
        (await readdir(`./build/commands/${cmdGroupDirName}/${subcmdGroupDirName}/`))
          .filter(f=>f.endsWith(".js"))
      ) {
        const subcmdFile = (await import(`../commands/${cmdGroupDirName}/${subcmdGroupDirName}/${subcmdFileName}`)).default as SubcommandFile;
        const subcmd = {
          ...commandLike,
          isSubCommand: true,
          ...subcmdFile,
          data: subcmdFile.data(new SlashCommandSubcommandBuilder())
        } as Subcommand;
        console.log("Loading /" + cmdGroup.data.name + " " + subcmdGroup.data.name + " " + subcmd.data.name);
        subcmdGroup.data.addSubcommand(subcmdFile.data)
        subcmdGroup.subCommands[subcmd.data.name] = subcmd;
      }

      cmdGroup.data.addSubcommandGroup(subcmdGroupFile.data);
      cmdGroup.subCommands[subcmdGroup.data.name] = subcmdGroup;
    }

    commands[cmdGroup.data.name] = cmdGroup;
  }

  return commands;
}
