import { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";

type CommandRun = (cmd: ChatInputCommandInteraction) => void;

interface CommandLike {
  isCommand: this is Command;
  isCommandGroup: this is CommandGroup;
  isSubCommandGroup: this is SubcommandGroup;
  isSubCommand: this is Subcommand;
}

interface CommandRunnable extends CommandLike {
  run: CommandRun;
}

interface CommandRoot extends CommandLike {
  admin: boolean;
}

interface Command extends CommandRunnable, CommandRoot {
  data: SlashCommandBuilder;
  isCommand: true;
  isCommandGroup: false;
  isSubCommandGroup: false;
  isSubCommand: false;
}

interface CommandGroup extends CommandRoot {
  data: SlashCommandBuilder;
  subCommands: { [key: string]: (SubcommandGroup | Subcommand) };
}

interface Subcommand extends CommandRunnable {
  data: SlashCommandSubcommandBuilder;
}

interface SubcommandGroup extends CommandLike {
  data: SlashCommandBuilder;
  subCommands: { [key: string]: Subcommand };
}


// File structure :

interface CommandFile {
  admin: boolean;
  data: SlashCommandBuilder;
  run: CommandRun;
}

interface CommandGroupIndexFile {
  admin: boolean;
  data: SlashCommandBuilder;
}

interface SubcommandFile {
  data: (subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder;
  run: CommandRun;
}

interface SubcommandGroupIndexFile {
  data: (subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashCommandSubcommandGroupBuilder;
}