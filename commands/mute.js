const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { aLeRole } = require('../utils/checkRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mettre en sourdine un membre (timeout)')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Membre à mute').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('duree').setDescription('Durée en minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison du mute').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!aLeRole(interaction.member))
      return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.', ephemeral: true });

    const target = interaction.options.getMember('utilisateur');
    const duree = interaction.options.getInteger('duree');
    const raison = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Tu ne peux pas te mute toi-même.', ephemeral: true });

    await target.timeout(duree * 60 * 1000, raison);

    const embed = new EmbedBuilder()
      .setTitle('🔇 Membre Mute')
      .setColor(0xFFFF00)
      .addFields(
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
        { name: 'Durée', value: `${duree} minute(s)`, inline: true },
        { name: 'Raison', value: raison }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};