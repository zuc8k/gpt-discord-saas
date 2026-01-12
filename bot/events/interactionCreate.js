const checkPermission = require("../middlewares/checkPermission");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // ================== PERMISSION CHECK ==================
    if (command.permission) {
      const allowed = checkPermission(interaction, command.permission);

      if (!allowed) {
        return interaction.reply({
          content: "❌ ليس لديك صلاحية استخدام هذا الأمر",
          ephemeral: true
        });
      }
    }

    // ================== EXECUTE ==================
    await command.execute(interaction);

  } catch (err) {
    console.error("❌ interaction error:", err);

    // منع double reply
    if (interaction.replied || interaction.deferred) return;

    interaction.reply({
      content: "❌ حصل خطأ أثناء تنفيذ الأمر",
      ephemeral: true
    });
  }
};