const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { aLeRole } = require('../utils/checkRoles');
const fs = require('fs');
const path = require('path');

const warnsFile = path.join(__dirname, '..', 'data', 'warns.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Voir les avertissements d\'un membre')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Membre à consulter').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!aLeRole(interaction.member))
      return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.', ephemeral: true });

    const target = interaction.options.getMember('utilisateur');
    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

    let warns = {};
    if (fs.existsSync(warnsFile)) warns = JSON.parse(fs.readFileSync(warnsFile, 'utf8'));

    const key = `${interaction.guild.id}_${target.id}`;
    const userWarns = warns[key] || [];

    const embed = new EmbedBuilder()
      .setTitle(`📋 Warns — ${target.user.tag}`)
      .setColor(userWarns.length === 0 ? 0x00FF88 : 0xFFAA00)
      .setTimestamp();

    if (userWarns.length === 0) {
      embed.setDescription('✅ Aucun avertissement.');
    } else {
      embed.setDescription(`Total : **${userWarns.length}** avertissement(s)`);
      userWarns.forEach((w, i) => {
        embed.addFields({ name: `#${i + 1} — ${new Date(w.date).toLocaleDateString('fr-FR')}`, value: `📋 ${w.raison}\n👤 Par : ${w.moderateur}` });
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};