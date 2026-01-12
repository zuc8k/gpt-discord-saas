const { SlashCommandBuilder } = require("discord.js");
const Guild = require("../../api/models/Guild");
const { sendLog } = require("../services/logger");
const PERMS = require("../../shared/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-gpt")
    .setDescription("تحديد قناة الشات الخاصة بالـ GPT")
    .addChannelOption(opt =>
      opt.setName("channel")
        .setDescription("قناة الشات")
        .setRequired(true)
    ),

  // 🔐 الصلاحيات (Admin فقط)
  permission: PERMS.ADMIN,

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    // إنشاء / تحديث السيرفر
    const guild = await Guild.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        gptChannel: channel.id
      },
      { upsert: true, new: true }
    );

    // رد للمستخدم
    await interaction.reply(`✅ تم تحديد قناة GPT بنجاح: ${channel}`);

    // Log
    await sendLog(interaction.client, guild, {
      title: "⚙️ GPT Channel Configured",
      description:
        `Admin: ${interaction.user.tag}\n` +
        `Channel: ${channel}`
    });
  }
};