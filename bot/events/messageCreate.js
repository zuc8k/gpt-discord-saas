const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const Guild = require("../../api/models/Guild");
const ChatMessage = require("../../api/models/ChatMessage");
const plans = require("../../shared/plans");

const { countLines } = require("../../shared/utils");
const { shouldReset } = require("../../shared/resetLimits");
const { shouldResetDaily } = require("../../shared/resetDaily");

const { askGPT } = require("../services/openai");
const { isBlocked } = require("../services/contentFilter");
const { checkSpam } = require("../services/antiSpam");

module.exports = async (client, message) => {
  let replied = false;

  try {
    if (!message?.guild) return;
    if (message.author?.bot) return;
    if (!message.content?.trim()) return;

    /* ================== ANTI SPAM ================== */
    if (checkSpam(message.author.id)) {
      replied = true;
      return message.reply("⏳ استنى شوية يا نجم 😅");
    }

    /* ================== LOAD GUILD ================== */
    let guild = await Guild.findOne({ guildId: message.guild.id });

    /* ================== FIRST TIME (FREE TRIAL) ================== */
    if (!guild) {
      guild = new Guild({
        guildId: message.guild.id,
        plan: "FREE",

        dailyLimit: plans.FREE.dailyLines,
        usedDailyLines: 0,
        lastDailyReset: new Date(),

        monthlyLimit: plans.FREE.monthlyLines,
        usedLines: 0,

        expiresAt: Date.now() + plans.FREE.days * 24 * 60 * 60 * 1000,
        lastReset: new Date(),

        expiredNotified: false
      });

      await guild.save();

      replied = true;
      return message.reply(
        "🎉 فعلنا لك النسخة **FREE** لمدة 7 أيام!\n" +
        "📆 Daily: 500 سطر\n" +
        "📊 Monthly: 10,000 سطر\n\n" +
        "استمتع واهزر براحتك 😎"
      );
    }

    /* ================== GPT CHANNEL CHECK ================== */
    if (guild.gptChannel && message.channel.id !== guild.gptChannel) return;

    /* ================== RESET MONTHLY ================== */
    if (shouldReset(guild.lastReset)) {
      guild.usedLines = 0;
      guild.lastReset = new Date();
      guild.expiredNotified = false;
    }

    /* ================== RESET DAILY ================== */
    if (shouldResetDaily(guild.lastDailyReset)) {
      guild.usedDailyLines = 0;
      guild.lastDailyReset = new Date();
    }

    await guild.save();

    /* ================== EXPIRED ================== */
    if (guild.expiresAt && Date.now() > guild.expiresAt) {

      if (!guild.expiredNotified) {
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("⏳ انتهت الفترة التجريبية")
          .setDescription(
            `
🚫 **الشات متوقف حاليًا**

خلصت تجربة الـ **7 أيام**  
علشان ترجع تشتغل بكل القوة 💪

😂 GPT هزار  
🧠 ذكي  
🖼️ صور  
🇪🇬 عربي / 🇺🇸 English  

📩 كلم الدعم وفعّل اشتراكك
            `
          )
          .setFooter({
            text: "Created by Boody Zuckerberg"
          });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("💬 Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/YOUR_SUPPORT_SERVER")
        );

        await message.channel.send({
          embeds: [embed],
          components: [row]
        });

        guild.expiredNotified = true;
        await guild.save();
      }

      replied = true;
      return message.reply("🔒 الشات مقفول – كلم الدعم 👆");
    }

    /* ================== FILTER ================== */
    if (isBlocked(message.content)) {
      replied = true;
      return message.reply("🚫 الكلام ده مش مسموح 👀");
    }

    /* ================== LIMIT CHECK ================== */
    const userLines = countLines(message.content);

    if (guild.usedDailyLines + userLines > guild.dailyLimit) {
      replied = true;
      return message.reply("⚠️ وصلت للحد اليومي يا بطل 😅");
    }

    if (guild.usedLines + userLines > guild.monthlyLimit) {
      replied = true;
      return message.reply("📆 وصلت للحد الشهري");
    }

    /* ================== LOAD CONTEXT ================== */
    const history = await ChatMessage.find({ guildId: guild.guildId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const messagesForGPT = history
      .reverse()
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    messagesForGPT.push({
      role: "user",
      content: message.content
    });

    /* ================== SAVE USER ================== */
    await ChatMessage.create({
      guildId: guild.guildId,
      role: "user",
      content: message.content,
      plan: guild.plan
    });

    /* ================== GPT ================== */
    await message.channel.sendTyping();

    const reply = await askGPT({
      messages: messagesForGPT,
      plan: guild.plan
    });

    const botLines = countLines(reply);
    const totalLines = userLines + botLines;

    guild.usedDailyLines += totalLines;
    guild.usedLines += totalLines;
    await guild.save();

    /* ================== SAVE BOT ================== */
    await ChatMessage.create({
      guildId: guild.guildId,
      role: "assistant",
      content: reply,
      plan: guild.plan
    });

    replied = true;
    await message.reply(reply);

  } catch (err) {
    console.error("❌ messageCreate error:", err);
    if (!replied) {
      try {
        await message.reply("❌ حصل خطأ مؤقت، جرب تاني 😅");
      } catch {}
    }
  }
};