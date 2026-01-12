const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("website")
    .setDescription("رابط الموقع"),

  async execute(interaction) {
    interaction.reply("🌐 https://your-website.com");
  }
};