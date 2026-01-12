const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const Guild = require("../../api/models/Guild");
const plans = require("../../shared/plans");

module.exports = async (client, guild) => {
  try {
    // ================== CHECK DB ==================
    const exists = await Guild.findOne({ guildId: guild.id });
    if (exists) return;

    // ================== CREATE GUILD ==================
    const newGuild = await Guild.create({
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

    // ================== FIND CHANNEL ==================
    let channel =
      guild.systemChannel ||
      guild.channels.cache.find(c =>
        c.isTextBased() &&
        c.permissionsFor(guild.members.me)
          ?.has(PermissionsBitField.Flags.SendMessages)
      );

    if (!channel) return;

    // ================== EMBED ==================
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("🤖 GPT Bot Activated Successfully!")
      .setDescription(
        `
🎉 **أهلاً بيكم في عالم الذكاء الاصطناعي 😎**

أنا **GPT Bot**  
هزار شوية 🤪  
ذكي شوية 🧠  
ومصري على مزاجك 🇪🇬🔥  

🎁 **Free Trial – 7 Days**
• شات GPT كامل  
• عربي / English تلقائي  
• هزار + ردود ذكية  
• دعم صور 🖼️  
• Limits حسب الباقة  

⏳ **بعد انتهاء التجربة:**
🔒 الشات هيقف تلقائي  
📩 هيجيلك تنبيه للاشتراك  

⚙️ **ابدأ دلوقتي**
اكتب:
/setup-gpt
وحدد قناة الشات 👇

👑 **Created by: Boody Zuckerberg**
        `
      )
      .setFooter({
        text: "FREE Trial Active • 7 Days"
      })
      .setTimestamp();

    // ================== BUTTON ==================
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("💬 Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.gg/YOUR_SUPPORT_SERVER") // 🔴 غير الرابط
    );

    // ================== SEND ==================
    await channel.send({
      embeds: [embed],
      components: [row]
    });

  } catch (err) {
    console.error("❌ guildCreate error:", err);
  }
};