const Guild = require("../../api/models/Guild");
const { countLines } = require("../../shared/utils");
const { askGPT } = require("../services/openai");
const { sendLog } = require("../services/logger");

module.exports = async (client, message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const guild = await Guild.findOne({ guildId: message.guild.id });
  if (!guild) return;

  if (guild.gptChannel && message.channel.id !== guild.gptChannel) return;

  // اشتراك منتهي
  if (guild.expiresAt && Date.now() > guild.expiresAt) {
    await sendLog(client, guild, {
      title: "❌ Subscription Expired",
      color: "Red",
      description: `User: ${message.author.tag}`
    });

    return message.reply("❌ الاشتراك انتهى\n🔗 SERVER SUPPORT");
  }

  const userLines = countLines(message.content);

  // ليمت
  if (guild.usedLines + userLines > guild.monthlyLimit) {
    await sendLog(client, guild, {
      title: "⚠️ Limit Reached",
      color: "Yellow",
      description: `User: ${message.author.tag}\nUsed: ${guild.usedLines}/${guild.monthlyLimit}`
    });

    return message.reply("⚠️ وصلت للحد الأقصى للباقة");
  }

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

    message.reply(reply);

  } catch (err) {
    console.error(err);

    await sendLog(client, guild, {
      title: "❌ AI Error",
      color: "Red",
      description: err.message
    });

    message.reply("❌ حصل خطأ في الذكاء الاصطناعي");
  }
};