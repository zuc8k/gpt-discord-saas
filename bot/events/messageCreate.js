const Guild = require("../../api/models/Guild");
const { countLines } = require("../../shared/utils");
const { askGPT } = require("../services/openai");

module.exports = async (client, message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const guild = await Guild.findOne({ guildId: message.guild.id });
  if (!guild) return;

  // لو مش قناة GPT
  if (guild.gptChannel && message.channel.id !== guild.gptChannel) return;

  // اشتراك انتهى
  if (guild.expiresAt && Date.now() > guild.expiresAt) {
    return message.reply(
      "❌ الاشتراك انتهى\n🔗 SERVER SUPPORT"
    );
  }

  const userLines = countLines(message.content);

  // تجاوز الليمت
  if (guild.usedLines + userLines > guild.monthlyLimit) {
    return message.reply("⚠️ وصلت للحد الأقصى للباقة");
  }

  await message.channel.sendTyping();

  try {
    const reply = await askGPT(message.content);
    const botLines = countLines(reply);

    guild.usedLines += (userLines + botLines);
    await guild.save();

    await message.reply(reply);

  } catch (err) {
    console.error(err);
    message.reply("❌ حصل خطأ في الذكاء الاصطناعي");
  }
};