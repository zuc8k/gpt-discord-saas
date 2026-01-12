const Guild = require("../../api/models/Guild");
const plans = require("../../shared/plans");
const { countLines } = require("../../shared/utils");
const { shouldReset } = require("../../shared/resetLimits");

const { askGPT } = require("../services/openai");
const { sendLog } = require("../services/logger");
const { isBlocked } = require("../services/contentFilter");
const { checkSpam } = require("../services/antiSpam");

module.exports = async (client, message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  // ================== ANTI SPAM ==================
  if (checkSpam(message.author.id)) {
    return message.reply("⏳ استنى شوية قبل ما تبعت تاني");
  }

  let guild = await Guild.findOne({ guildId: message.guild.id });

  // ================== FIRST TIME (FREE TRIAL) ==================
  if (!guild) {
    guild = new Guild({
      guildId: message.guild.id,
      plan: "FREE",
      monthlyLimit: plans.FREE.monthlyLines,
      yearlyLimit: plans.FREE.yearlyLines,
      usedLines: 0,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      lastReset: new Date()
    });

    await guild.save();

    return message.reply(
      "🎉 تم تفعيل النسخة التجريبية **FREE** لمدة 7 أيام\n" +
      "📊 Limit: 10,000 سطر\n" +
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

    return message.reply("🚫 الطلب غير مسموح");
  }

  // ================== AUTO RESET MONTHLY ==================
  if (shouldReset(guild.lastReset)) {
    guild.usedLines = 0;
    guild.lastReset = new Date();
    await guild.save();

    await sendLog(client, guild, {
      title: "♻️ Monthly Reset",
      description: "تم تصفير الاستهلاك الشهري"
    });
  }

  // ================== EXPIRED ==================
  if (guild.expiresAt && Date.now() > guild.expiresAt) {
    await sendLog(client, guild, {
      title: "❌ Subscription Expired",
      color: "Red",
      description: `User: ${message.author.tag}`
    });

    return message.reply(
      "❌ انتهت مدة الاستخدام\n" +
      "🔗 SERVER SUPPORT"
    );
  }

  // ================== LIMIT CHECK ==================
  const userLines = countLines(message.content);

  if (userLines > 500) {
    return message.reply("⚠️ الرسالة طويلة جدًا");
  }

  if (guild.usedLines + userLines > guild.monthlyLimit) {
    await sendLog(client, guild, {
      title: "⚠️ Limit Reached",
      color: "Yellow",
      description:
        `User: ${message.author.tag}\n` +
        `Used: ${guild.usedLines}/${guild.monthlyLimit}`
    });

    return message.reply("⚠️ وصلت للحد الأقصى للباقة");
  }

  // ================== GPT RESPONSE ==================
  await message.channel.sendTyping();

  try {
    const reply = await askGPT(message.content);
    const botLines = countLines(reply);

    guild.usedLines += userLines + botLines;
    await guild.save();

    await sendLog(client, guild, {
      title: "💬 GPT Request",
      color: "Green",
      description:
        `User: ${message.author.tag}\n` +
        `Lines Used: ${userLines + botLines}\n` +
        `Total: ${guild.usedLines}/${guild.monthlyLimit}`
    });

    await message.reply(reply);

  } catch (err) {
    console.error(err);

    await sendLog(client, guild, {
      title: "❌ AI Error",
      color: "Red",
      description: err.message
    });

    message.reply("❌ حصل خطأ مؤقت، حاول لاحقًا");
  }
};