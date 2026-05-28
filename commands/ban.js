const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { aLeRole } = require('../utils/checkRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre du serveur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Membre à bannir').setRequired(true))
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison du ban').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    if (!aLeRole(interaction.member))
      return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.', ephemeral: true });

    const target = interaction.options.getMember('utilisateur');
    const raison = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '❌ Je ne peux pas bannir ce membre.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Tu ne peux pas te bannir toi-même.', ephemeral: true });

    await target.send(`🔨 Tu as été **banni** du serveur **${interaction.guild.name}**.\n📋 Raison : ${raison}`).catch(() => {});
    await target.ban({ reason: raison });

    const embed = new EmbedBuilder()
      .setTitle('🔨 Membre Banni')
      .setColor(0xFF0000)
      .addFields(
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
        { name: 'Raison', value: raison }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};