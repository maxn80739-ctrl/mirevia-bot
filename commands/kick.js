const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { aLeRole } = require('../utils/checkRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulser un membre du serveur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Membre à expulser').setRequired(true))
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison du kick').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    if (!aLeRole(interaction.member))
      return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.', ephemeral: true });

    const target = interaction.options.getMember('utilisateur');
    const raison = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: '❌ Je ne peux pas expulser ce membre.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Tu ne peux pas te kick toi-même.', ephemeral: true });

    await target.send(`👢 Tu as été **expulsé** du serveur **${interaction.guild.name}**.\n📋 Raison : ${raison}`).catch(() => {});
    await target.kick(raison);

    const embed = new EmbedBuilder()
      .setTitle('👢 Membre Expulsé')
      .setColor(0xFF8800)
      .addFields(
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
        { name: 'Raison', value: raison }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};