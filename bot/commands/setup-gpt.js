const { SlashCommandBuilder } = require("discord.js");
const Guild = require("../../api/models/Guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-gpt")
    .setDescription("حدد قناة الشات للـ GPT")
    .addChannelOption(opt =>
      opt.setName("channel")
        .setDescription("قناة الشات")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    await Guild.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { gptChannel: channel.id },
      { upsert: true }
    );

    interaction.reply(`✅ تم تحديد قناة GPT: ${channel}`);
  }
};