import { SlashCommandBuilder } from "@discordjs/builders";
const command = {
    admin: true,
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    run: (cmd) => {
        cmd.reply("🏓 Pong !");
    }
};
export default command;
