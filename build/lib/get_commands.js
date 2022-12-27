import { readdir } from "fs/promises";
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
    let commands = {};
    for (const cmdFileName of (await readdir("./build/commands/"))
        .filter(f => f.endsWith(".js"))) {
        const cmdFile = {
            ...commandLike,
            isCommand: true,
            ...(await import(`../commands/${cmdFileName}`)).default,
        };
        console.log("Loading /" + cmdFile.data.name);
        commands[cmdFile.data.name] = cmdFile;
    }
    for (const cmdGroupDirName of (await readdir("./build/commands/"))
        .filter(f => !f.endsWith(".js"))) {
        const cmdGroup = {
            ...commandLike,
            isCommandGroup: true,
            ...(await import(`../commands/${cmdGroupDirName}/index.js`)).default,
            subCommands: {}
        };
        console.log("Loading /" + cmdGroup.data.name);
        for (const subcmdFileName of (await readdir(`./build/commands/${cmdGroupDirName}/`))
            .filter(f => f.endsWith(".js") && f != "index.js")) {
            const subcmdFile = (await import(`../commands/${cmdGroupDirName}/${subcmdFileName}`)).default;
            const subcmd = {
                ...commandLike,
                isSubCommand: true,
                ...subcmdFile,
                data: subcmdFile.data(new SlashCommandSubcommandBuilder())
            };
            console.log("Loading /" + cmdGroup.data.name + " " + subcmd.data.name);
            cmdGroup.data.addSubcommand(subcmdFile.data);
            cmdGroup.subCommands[subcmd.data.name] = subcmd;
        }
        for (const subcmdGroupDirName of (await readdir(`./build/commands/${cmdGroupDirName}/`))
            .filter(f => !f.endsWith(".js"))) {
            const subcmdGroupFile = (await import(`../commands/${cmdGroupDirName}/${subcmdGroupDirName}/index.js`)).default;
            const subcmdGroup = {
                ...commandLike,
                isSubCommandGroup: true,
                ...subcmdGroupFile,
                data: subcmdGroupFile.data(new SlashCommandSubcommandGroupBuilder()),
                subCommands: {}
            };
            console.log("Loading /" + cmdGroup.data.name + " " + subcmdGroup.data.name);
            for (const subcmdFileName of (await readdir(`./build/commands/${cmdGroupDirName}/${subcmdGroupDirName}/`))
                .filter(f => f.endsWith(".js"))) {
                const subcmdFile = (await import(`../commands/${cmdGroupDirName}/${subcmdGroupDirName}/${subcmdFileName}`)).default;
                const subcmd = {
                    ...commandLike,
                    isSubCommand: true,
                    ...subcmdFile,
                    data: subcmdFile.data(new SlashCommandSubcommandBuilder())
                };
                console.log("Loading /" + cmdGroup.data.name + " " + subcmdGroup.data.name + " " + subcmd.data.name);
                subcmdGroup.data.addSubcommand(subcmdFile.data);
                subcmdGroup.subCommands[subcmd.data.name] = subcmd;
            }
            cmdGroup.data.addSubcommandGroup(subcmdGroupFile.data);
            cmdGroup.subCommands[subcmdGroup.data.name] = subcmdGroup;
        }
        commands[cmdGroup.data.name] = cmdGroup;
    }
    return commands;
}
