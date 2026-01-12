const { SlashCommandBuilder } = require("discord.js");
const Guild = require("../../api/models/Guild");
const applyPlan = require("../../shared/applyPlan");
const PERMS = require("../../shared/permissions");
const { sendLog } = require("../services/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("upgrade")
    .setDescription("ترقية الباقة (Owner فقط)")
    .addStringOption(opt =>
      opt.setName("plan")
        .setDescription("FREE / PRIME / PREMIUM / MAX")
        .setRequired(true)
        .addChoices(
          { name: "FREE", value: "FREE" },
          { name: "PRIME", value: "PRIME" },
          { name: "PREMIUM", value: "PREMIUM" },
          { name: "MAX", value: "MAX" }
        )
    )
    .addStringOption(opt =>
      opt.setName("duration")
        .setDescription("monthly / yearly")
        .setRequired(true)
        .addChoices(
          { name: "Monthly", value: "monthly" },
          { name: "Yearly", value: "yearly" }
        )
    ),

  permission: PERMS.OWNER,

  async execute(interaction) {
    const plan = interaction.options.getString("plan");
    const duration = interaction.options.getString("duration");

    let guild = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guild) {
      return interaction.reply({ content: "❌ السيرفر غير مسجل", ephemeral: true });
    }

    applyPlan(guild, plan, duration);
    await guild.save();

    await sendLog(interaction.client, guild, {
      title: "⬆️ Plan Upgraded",
      description:
        `By: ${interaction.user.tag}\n` +
        `Plan: ${plan}\nDuration: ${duration}`
    });

    interaction.reply(`✅ تم ترقية الباقة إلى **${plan} (${duration})**`);
  }
};