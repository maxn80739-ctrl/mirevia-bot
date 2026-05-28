const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { aLeRole } = require('../utils/checkRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprimer des messages en masse')
    .addIntegerOption(opt =>
      opt.setName('nombre').setDescription('Nombre de messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!aLeRole(interaction.member))
      return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.', ephemeral: true });

    const nombre = interaction.options.getInteger('nombre');
    await interaction.deferReply({ ephemeral: true });

    const deleted = await interaction.channel.bulkDelete(nombre, true);

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Messages Supprimés')
      .setColor(0x00AAFF)
      .setDescription(`**${deleted.size}** message(s) supprimé(s) par ${interaction.user.tag}`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};