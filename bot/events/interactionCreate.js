const checkPermission = require("../middlewares/checkPermission");
const checkPlan = require("../middlewares/checkPlan");
const checkCommandLimit = require("../middlewares/checkCommandLimit");

module.exports = async (client, interaction) => {
  if (!interaction || !interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // ================== PERMISSION CHECK (OWNER / ADMIN / USER) ==================
    if (command.permission) {
      const allowed = checkPermission(interaction, command.permission);

      if (!allowed) {
        if (!interaction.replied && !interaction.deferred) {
          return interaction.reply({
            content: "❌ ليس لديك صلاحية استخدام هذا الأمر",
            ephemeral: true
          });
        }
        return;
      }
    }

    // ================== PLAN CHECK (FREE / PRIME / PREMIUM / MAX) ==================
    if (command.minPlan) {
      const allowedPlan = await checkPlan(interaction, command.minPlan);

      if (!allowedPlan) {
        if (!interaction.replied && !interaction.deferred) {
          return interaction.reply({
            content: `🔒 الأمر ده متاح من باقة **${command.minPlan}** أو أعلى`,
            ephemeral: true
          });
        }
        return;
      }
    }

    // ================== COMMAND LIMIT CHECK (DAILY + MONTHLY) ==================
    const limitCheck = await checkCommandLimit(interaction);

    if (!limitCheck.allowed) {
      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply({
          content: limitCheck.message || "⚠️ وصلت للحد الأقصى لاستخدام الأمر",
          ephemeral: true
        });
      }
      return;
    }

    // ================== EXECUTE ==================
    await command.execute(interaction);

  } catch (err) {
    console.error("❌ interactionCreate error:", err);

    // ================== SAFE ERROR RESPONSE ==================
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: "❌ حصل خطأ أثناء تنفيذ الأمر",
          ephemeral: true
        });
      } catch {}
    }
  }
};