const { SlashCommandBuilder } = require("discord.js");
const PERMS = require("../../shared/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shutdown")
    .setDescription("إيقاف البوت (Owner فقط)"),

  permission: PERMS.OWNER,

  async execute(interaction) {
    await interaction.reply("🛑 Bot shutting down...");
    process.exit(0);
  }
};