const { EmbedBuilder } = require("discord.js");

async function sendLog(client, guild, data) {
  if (!guild.logsChannel) return;

  const channel = await client.channels.fetch(guild.logsChannel).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(data.color || "#2f3136")
    .setTitle(data.title || "Log")
    .setDescription(data.description || "—")
    .setTimestamp();

  if (data.footer) embed.setFooter({ text: data.footer });

  channel.send({ embeds: [embed] });
}

module.exports = { sendLog };