const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("مساعدة"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("📌 GPT Bot Help")
      .setDescription(`
/setup-gpt – تحديد قناة الشات  
/setup-logs – تحديد قناة اللوجات  
/subscribe – الاشتراكات  
/website – الموقع  
/uptime – حالة البوت
      `);

    interaction.reply({ embeds: [embed] });
  }
};