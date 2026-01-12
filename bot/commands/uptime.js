const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("حالة البوت"),

  async execute(interaction) {
    const uptime = process.uptime();
    interaction.reply(`🟢 البوت شغال\n⏱️ Uptime: ${Math.floor(uptime)} ثانية`);
  }
};