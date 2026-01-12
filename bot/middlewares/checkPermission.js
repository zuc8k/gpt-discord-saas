const { PermissionsBitField } = require("discord.js");
const PERMS = require("../../shared/permissions");

module.exports = function checkPermission(interaction, level) {
  // OWNER
  if (level === PERMS.OWNER) {
    return interaction.user.id === process.env.BOT_OWNER_ID;
  }

  // ADMIN (أدمن السيرفر)
  if (level === PERMS.ADMIN) {
    return interaction.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    );
  }

  // USER
  return true;
};