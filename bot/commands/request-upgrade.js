const { SlashCommandBuilder } = require("discord.js");
const PERMS = require("../../shared/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("request-upgrade")
    .setDescription("طلب ترقية الباقة (يرسل للدعم)"),

  permission: PERMS.ADMIN,

  async execute(interaction) {
    interaction.reply(
      "📨 تم إرسال طلب الترقية\n" +
      "🔗 تواصل مع الدعم: SERVER SUPPORT"
    );
  }
};