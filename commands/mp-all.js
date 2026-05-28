const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { aLeRole } = require('../utils/checkRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mp-all')
    .setDescription('📨 Envoyer un MP à TOUS les membres du serveur')
    .addStringOption(opt =>
      opt.setName('message').setDescription('Message à envoyer').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    if (!aLeRole(interaction.member))
      return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.', ephemeral: true });

    const message = interaction.options.getString('message');
    await interaction.deferReply({ ephemeral: true });

    const members = await interaction.guild.members.fetch();
    const humains = members.filter(m => !m.user.bot);

    let success = 0;
    let failed = 0;

    const embed = new EmbedBuilder()
      .setTitle(`📢 Message du serveur : ${interaction.guild.name}`)
      .setDescription(message)
      .setColor(0x5865F2)
      .addFields({ name: 'Envoyé par', value: `${interaction.user.tag}` })
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp();

    for (const [, member] of humains) {
      try {
        await member.send({ embeds: [embed] });
        success++;
      } catch {
        failed++;
      }
      if ((success + failed) % 5 === 0) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const result = new EmbedBuilder()
      .setTitle('📨 Résultat — MP All')
      .setColor(success > 0 ? 0x00FF88 : 0xFF4444)
      .addFields(
        { name: '👥 Total', value: `${humains.size}`, inline: true },
        { name: '✅ Envoyés', value: `${success}`, inline: true },
        { name: '❌ Échoués', value: `${failed}`, inline: true },
        { name: '📝 Message', value: message }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [result] });
  }
};