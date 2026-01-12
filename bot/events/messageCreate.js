const Guild = require("../../api/models/Guild");
const plans = require("../../shared/plans");
const { countLines } = require("../../shared/utils");
const { shouldReset } = require("../../shared/resetLimits");
const { shouldResetDaily } = require("../../shared/resetDaily");

const { askGPT } = require("../services/openai");
const { sendLog } = require("../services/logger");
const { isBlocked } = require("../services/contentFilter");
const { checkSpam } = require("../services/antiSpam");

module.exports = async (client, message) => {
  let replied = false;

  try {
    if (!message || !message.guild) return;
    if (message.author?.bot) return;

    // ================== EMPTY MESSAGE ==================
    if (!message.content || !message.content.trim()) return;

    // ================== ANTI SPAM ==================
    if (checkSpam(message.author.id)) {
      replied = true;
      return message.reply("⏳ استنى شوية قبل ما تبعت تاني");
    }

    let guild = await Guild.findOne({ guildId: message.guild.id });

    // ================== FIRST TIME (FREE TRIAL) ==================
    if (!guild) {
      guild = new Guild({
        guildId: message.guild.id,
        plan: "FREE",

        dailyLimit: plans.FREE.dailyLines,
        usedDailyLines: 0,
        lastDailyReset: new Date(),

        monthlyLimit: plans.FREE.monthlyLines,
        yearlyLimit: plans.FREE.yearlyLines,
        usedLines: 0,

        commandUsage: {},
        expiresAt: Date.now() + plans.FREE.days * 24 * 60 * 60 * 1000,
        lastReset: new Date()
      });

      await guild.save();

      replied = true;
      return message.reply(
        "🎉 تم تفعيل النسخة التجريبية **FREE** لمدة 7 أيام\n" +
        "📆 Daily Limit: 500 سطر\n" +
        "📊 Monthly Limit: 10,000 سطر\n" +
        "🔗 SERVER SUPPORT"
      );
    }

    // ================== GPT CHANNEL CHECK ==================
    if (guild.gptChannel && message.channel.id !== guild.gptChannel) return;

    // ================== CONTENT FILTER ==================
    if (isBlocked(message.content)) {
      await sendLog(client, guild, {
        title: "🚫 Blocked Content",
        color: "Red",
        description:
          `User: ${message.author.tag}\n` +
          `Message: ${message.content.slice(0, 200)}`
      });

      replied = true;
      return message.reply("🚫 الطلب غير مسموح");
    }

    // ================== AUTO RESET MONTHLY ==================
    if (shouldReset(guild.lastReset)) {
      guild.usedLines = 0;
      guild.commandUsage = {};
      guild.lastReset = new Date();

      await sendLog(client, guild, {
        title: "♻️ Monthly Reset",
        description: "تم تصفير الاستهلاك الشهري (السطور + الأوامر)"
      });
    }

    // ================== AUTO RESET DAILY ==================
    if (shouldResetDaily(guild.lastDailyReset)) {
      guild.usedDailyLines = 0;
      guild.lastDailyReset = new Date();
    }

    await guild.save();

    // ================== EXPIRED ==================
    if (guild.expiresAt && Date.now() > guild.expiresAt) {
      await sendLog(client, guild, {
        title: "❌ Subscription Expired",
        color: "Red",
        description: `User: ${message.author.tag}`
      });

      replied = true;
      return message.reply(
        "❌ انتهت مدة الاستخدام\n" +
        "🔗 SERVER SUPPORT"
      );
    }

    // ================== LIMIT CHECK ==================
    const userLines = countLines(message.content);

    if (userLines > 500) {
      replied = true;
      return message.reply("⚠️ الرسالة طويلة جدًا");
    }

    // 🔒 DAILY LIMIT
    if (guild.usedDailyLines + userLines > guild.dailyLimit) {
      replied = true;
      return message.reply("⚠️ وصلت للحد اليومي المسموح");
    }

    // 🔒 MONTHLY LIMIT
    if (guild.usedLines + userLines > guild.monthlyLimit) {
      await sendLog(client, guild, {
        title: "⚠️ Monthly Limit Reached",
        color: "Yellow",
        description:
          `User: ${message.author.tag}\n` +
          `Used: ${guild.usedLines}/${guild.monthlyLimit}`
      });

      replied = true;
      return message.reply("⚠️ وصلت للحد الشهري للباقة");
    }

    // ================== GPT RESPONSE ==================
    const typingPromise = message.channel.sendTyping();

    const reply = await askGPT(message.content);
    const botLines = countLines(reply);
    const totalLines = userLines + botLines;

    guild.usedLines += totalLines;
    guild.usedDailyLines += totalLines;
    await guild.save();

    await sendLog(client, guild, {
      title: "💬 GPT Request",
      color: "Green",
      description:
        `User: ${message.author.tag}\n` +
        `Lines Used: ${totalLines}\n` +
        `Daily: ${guild.usedDailyLines}/${guild.dailyLimit}\n` +
        `Monthly: ${guild.usedLines}/${guild.monthlyLimit}`
    });

    await typingPromise;
    replied = true;
    await message.reply(reply);

  } catch (err) {
    console.error("❌ messageCreate error:", err);

    if (!replied) {
      try {
        await message.reply("❌ حصل خطأ مؤقت، حاول لاحقًا");
      } catch {}
    }
  }
};