const Guild = require("../../api/models/Guild");
const { countLines } = require("../../shared/utils");

module.exports = async (message) => {
  if (message.author.bot) return;

  const guild = await Guild.findOne({ guildId: message.guild.id });
  if (!guild) return;

  if (Date.now() > guild.expiresAt) {
    return message.reply(
      "❌ الاشتراك انتهى\n🔗 SERVER SUPPORT"
    );
  }

  const lines = countLines(message.content);

  if (guild.usedLines + lines > guild.monthlyLimit) {
    return message.reply("⚠️ وصلت للحد الأقصى");
  }

  guild.usedLines += lines;
  await guild.save();

  // هنا هتنادي AI
};