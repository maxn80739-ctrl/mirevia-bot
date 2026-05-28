
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('📊 Affiche les statistiques du serveur'),

  async execute(interaction) {
    await interaction.deferReply();

    const guild = interaction.guild;
    const members = await guild.members.fetch();

    const total = members.size;
    const bots = members.filter(m => m.user.bot).size;
    const humains = total - bots;
    const enligne = members.filter(m => m.presence?.status === 'online').size;
    const absents = members.filter(m => m.presence?.status === 'idle').size;
    const occupes = members.filter(m => m.presence?.status === 'dnd').size;

    const salons = guild.channels.cache;
    const textuels = salons.filter(c => c.type === 0).size;
    const vocaux = salons.filter(c => c.type === 2).size;
    const categories = salons.filter(c => c.type === 4).size;

    const roles = guild.roles.cache.size - 1;
    const emojis = guild.emojis.cache.size;
    const boosts = guild.premiumSubscriptionCount || 0;
    const niveauBoost = guild.premiumTier;
    const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`;

    const embed = new EmbedBuilder()
      .setTitle(`📊 Statistiques — ${guild.name}`)
      .setColor(0x5865F2)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👥 Membres', value: `Total : **${humains}** humains + **${bots}** bots`, inline: false },
        { name: '🟢 En ligne', value: `${enligne}`, inline: true },
        { name: '🌙 Absent', value: `${absents}`, inline: true },
        { name: '🔴 Occupé', value: `${occupes}`, inline: true },
        { name: '💬 Salons texte', value: `${textuels}`, inline: true },
        { name: '🔊 Salons vocaux', value: `${vocaux}`, inline: true },
        { name: '📁 Catégories', value: `${categories}`, inline: true },
        { name: '🎭 Rôles', value: `${roles}`, inline: true },
        { name: '😀 Emojis', value: `${emojis}`, inline: true },
        { name: '💎 Boosts', value: `${boosts} (Niveau ${niveauBoost})`, inline: true },
        { name: '📅 Créé le', value: createdAt, inline: false },
        { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: false }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};