const checkPermission = require("../middlewares/checkPermission");
const checkPlan = require("../middlewares/checkPlan");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // ================== PERMISSION CHECK (OWNER / ADMIN / USER) ==================
    if (command.permission) {
      const allowed = checkPermission(interaction, command.permission);

      if (!allowed) {
        return interaction.reply({
          content: "❌ ليس لديك صلاحية استخدام هذا الأمر",
          ephemeral: true
        });
      }
    }

    // ================== PLAN CHECK (FREE / PRIME / PREMIUM / MAX) ==================
    if (command.minPlan) {
      const allowedPlan = await checkPlan(interaction, command.minPlan);

      if (!allowedPlan) {
        return interaction.reply({
          content: `🔒 الأمر ده متاح من باقة **${command.minPlan}** أو أعلى`,
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