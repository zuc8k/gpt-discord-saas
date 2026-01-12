const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const Guild = require("../../api/models/Guild");
const { sendLog } = require("../services/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-gpt")
    .setDescription("تحديد قناة الشات الخاصة بالـ GPT")
    .addChannelOption(opt =>
      opt.setName("channel")
        .setDescription("قناة الشات")
        .setRequired(true)
    ),

  async execute(interaction) {
    // صلاحيات
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "❌ لازم تكون Admin",
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel("channel");

    // تحديث أو إنشاء السيرفر
    const guild = await Guild.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        gptChannel: channel.id
      },
      { upsert: true, new: true }
    );

    // رد
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