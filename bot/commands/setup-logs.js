const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const Guild = require("../../api/models/Guild");
const { sendLog } = require("../services/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-logs")
    .setDescription("تحديد قناة اللوجات الخاصة بالبوت")
    .addChannelOption(opt =>
      opt.setName("channel")
        .setDescription("قناة اللوجات")
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
        logsChannel: channel.id
      },
      { upsert: true, new: true }
    );

    // رد
    await interaction.reply(`📄 تم تحديد قناة اللوجات بنجاح: ${channel}`);

    // Log (هيظهر في نفس القناة الجديدة)
    await sendLog(interaction.client, guild, {
      title: "📄 Logs Channel Configured",
      description:
        `Admin: ${interaction.user.tag}\n` +
        `Channel: ${channel}`
    });
  }
};