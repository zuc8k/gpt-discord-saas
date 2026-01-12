const { SlashCommandBuilder } = require("discord.js");
const Guild = require("../../api/models/Guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-logs")
    .setDescription("حدد قناة اللوجات")
    .addChannelOption(opt =>
      opt.setName("channel")
        .setDescription("قناة اللوجات")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    await Guild.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { logsChannel: channel.id },
      { upsert: true }
    );

    interaction.reply(`📄 تم تحديد قناة اللوجات: ${channel}`);
  }
};