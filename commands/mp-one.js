const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { aLeRole } = require('../utils/checkRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mp-one')
    .setDescription('📩 Envoyer un MP à un membre spécifique')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Membre à contacter').setRequired(true))
    .addStringOption(opt =>
      opt.setName('message').setDescription('Message à envoyer').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!aLeRole(interaction.member))
      return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.', ephemeral: true });

    const target = interaction.options.getMember('utilisateur');
    const message = interaction.options.getString('message');

    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (target.user.bot) return interaction.reply({ content: '❌ Impossible d\'envoyer un MP à un bot.', ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle(`📩 Message — ${interaction.guild.name}`)
      .setDescription(message)
      .setColor(0x5865F2)
      .addFields({ name: 'Envoyé par', value: `${interaction.user.tag}` })
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp();

    try {
      await target.send({ embeds: [embed] });

      const confirm = new EmbedBuilder()
        .setTitle('✅ MP Envoyé')
        .setColor(0x00FF88)
        .addFields(
          { name: 'Destinataire', value: `${target.user.tag}`, inline: true },
          { name: 'Expéditeur', value: `${interaction.user.tag}`, inline: true },
          { name: 'Message', value: message }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [confirm], ephemeral: true });
    } catch {
      await interaction.reply({ content: `❌ Impossible d'envoyer le MP à **${target.user.tag}** (DMs fermés).`, ephemeral: true });
    }
  }
};