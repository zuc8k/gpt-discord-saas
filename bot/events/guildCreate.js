const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const Guild = require("../../api/models/Guild");
const plans = require("../../shared/plans");

module.exports = async (client, guild) => {
  try {
    // ================== CREATE DB RECORD ==================
    const exists = await Guild.findOne({ guildId: guild.id });
    if (exists) return;

    const newGuild = new Guild({
      guildId: guild.id,
      plan: "FREE",

      dailyLimit: plans.FREE.dailyLines,
      monthlyLimit: plans.FREE.monthlyLines,
      yearlyLimit: plans.FREE.yearlyLines,

      usedDailyLines: 0,
      usedLines: 0,

      lastDailyReset: new Date(),
      lastReset: new Date(),

      expiresAt: Date.now() + plans.FREE.days * 24 * 60 * 60 * 1000
    });

    await newGuild.save();

    // ================== FIND CHANNEL ==================
    const channel =
      guild.systemChannel ||
      guild.channels.cache.find(
        c => c.isTextBased() && c.permissionsFor(guild.members.me).has("SendMessages")
      );

    if (!channel) return;

    // ================== EMBED ==================
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("🤖 GPT Bot Activated")
      .setDescription(
        `
🎉 **أهلاً بيك!**

البوت اتفعل عندك بنجاح 😎  
عندك **7 أيام تجربة مجانية**.

🧠 **الميزات:**
• شات GPT هزار وذكي 😂  
• عربي 🇪🇬 / English 🇺🇸 تلقائي  
• دعم صور 🖼️  
• Limits ذكية حسب الباقة  

⏳ بعد انتهاء التجربة:
🔒 الشات هيقف  
📩 هيظهر تنبيه للاشتراك

👑 **صُنع بواسطة: Boody Zuckerberg**
        `
      )
      .setFooter({
        text: "FREE Trial – 7 Days"
      });

    // ================== BUTTON ==================
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.gg/YOUR_SUPPORT_SERVER")
    );

    await channel.send({
      embeds: [embed],
      components: [row]
    });

  } catch (err) {
    console.error("❌ guildCreate error:", err);
  }
};