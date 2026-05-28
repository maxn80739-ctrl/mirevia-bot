const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infos')
    .setDescription('📋 Infos sur un membre')
    .addSubcommand(sub =>
      sub.setName('profil')
        .setDescription('Voir le profil d\'un membre')
        .addUserOption(opt =>
          opt.setName('utilisateur').setDescription('Membre (toi si vide)').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('avatar')
        .setDescription('Voir l\'avatar d\'un membre')
        .addUserOption(opt =>
          opt.setName('utilisateur').setDescription('Membre (toi si vide)').setRequired(false))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getMember('utilisateur') || interaction.member;
    const user = target.user;

    if (sub === 'profil') {
      const roles = target.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => `<@&${r.id}>`)
        .slice(0, 10)
        .join(', ') || 'Aucun rôle';

      const rejoignedAt = `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>`;
      const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`;

      const statuts = {
        online: '🟢 En ligne',
        idle: '🌙 Absent',
        dnd: '🔴 Occupé',
        offline: '⚫ Hors ligne'
      };
      const statut = statuts[target.presence?.status || 'offline'];

      const badges = [];
      const flags = user.flags?.toArray() || [];
      if (flags.includes('Staff')) badges.push('👨‍💼 Staff Discord');
      if (flags.includes('Partner')) badges.push('🤝 Partenaire');
      if (flags.includes('Hypesquad')) badges.push('🏠 HypeSquad');
      if (flags.includes('BugHunterLevel1')) badges.push('🐛 Bug Hunter');
      if (flags.includes('ActiveDeveloper')) badges.push('👨‍💻 Développeur Actif');
      if (user.bot) badges.push('🤖 Bot');

      const embed = new EmbedBuilder()
        .setTitle(`📋 Profil — ${user.tag}`)
        .setColor(target.displayHexColor || 0x5865F2)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '🪪 ID', value: user.id, inline: true },
          { name: '📡 Statut', value: statut, inline: true },
          { name: '🎨 Couleur', value: target.displayHexColor || 'Aucune', inline: true },
          { name: '📅 Compte créé', value: createdAt, inline: true },
          { name: '📥 A rejoint le', value: rejoignedAt, inline: true },
          { name: `🎭 Rôles (${target.roles.cache.size - 1})`, value: roles }
        )
        .setTimestamp();

      if (badges.length > 0) {
        embed.addFields({ name: '🏅 Badges', value: badges.join('\n') });
      }

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'avatar') {
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
      const embed = new EmbedBuilder()
        .setTitle(`🖼️ Avatar — ${user.tag}`)
        .setColor(0x5865F2)
        .setImage(avatarURL)
        .addFields(
          { name: '🔗 Liens', value: `[PNG](${user.displayAvatarURL({ format: 'png', size: 1024 })}) | [JPG](${user.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [WEBP](${user.displayAvatarURL({ format: 'webp', size: 1024 })})` }
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
  }
};