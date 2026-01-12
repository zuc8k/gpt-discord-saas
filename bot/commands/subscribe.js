const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("subscribe")
    .setDescription("خطط الاشتراك"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("💳 الاشتراكات")
      .setDescription(`
MAX – 50$/سنة  
Premium – 25$/سنة  
Prime – 13$/سنة  

🌐 استخدم /website
      `);

    interaction.reply({ embeds: [embed] });
  }
};