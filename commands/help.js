const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📖 Voir toutes les commandes disponibles'),

  async execute(interaction) {
    const mainEmbed = new EmbedBuilder()
      .setTitle('📖 Menu d\'aide — Mirevia RP')
      .setDescription('Sélectionne une catégorie dans le menu ci-dessous.')
      .setColor(0x5865F2)
      .addFields(
        { name: '🛡️ Modération', value: 'Commandes réservées aux modérateurs', inline: true },
        { name: '🎮 Fun', value: 'Commandes amusantes pour tous', inline: true },
        { name: '📊 Infos', value: 'Statistiques et informations', inline: true }
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help_menu')
        .setPlaceholder('📂 Choisis une catégorie...')
        .addOptions([
          { label: '🛡️ Modération', description: 'Ban, kick, mute, warn, clear...', value: 'moderation' },
          { label: '📨 Messages Privés', description: 'MP à un membre ou tout le serveur', value: 'mp' },
          { label: '🎮 Fun', description: '8ball, pile ou face, dé, RPS...', value: 'fun' },
          { label: '📊 Statistiques', description: 'Stats du serveur', value: 'stats' },
          { label: '📋 Infos Membre', description: 'Profil et avatar', value: 'infos' },
          { label: '⚙️ Configuration', description: 'Anti-lien, anti-spam', value: 'config' },
        ])
    );

    const msg = await interaction.reply({ embeds: [mainEmbed], components: [menu], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: '❌ Ce menu ne t\'appartient pas.', ephemeral: true });

      const embeds = {
        moderation: new EmbedBuilder().setTitle('🛡️ Modération').setColor(0xFF4444).addFields(
          { name: '/ban', value: '`[utilisateur]` `[raison]` — Bannir un membre' },
          { name: '/kick', value: '`[utilisateur]` `[raison]` — Expulser un membre' },
          { name: '/mute', value: '`[utilisateur]` `[durée]` `[raison]` — Timeout un membre' },
          { name: '/warn', value: '`[utilisateur]` `[raison]` — Avertir un membre' },
          { name: '/warns', value: '`[utilisateur]` — Voir les warns d\'un membre' },
          { name: '/clear', value: '`[nombre]` — Supprimer 1 à 100 messages' }
        ).setFooter({ text: '🔒 Réservé aux modérateurs' }),

        mp: new EmbedBuilder().setTitle('📨 Messages Privés').setColor(0x5865F2).addFields(
          { name: '/mp-one', value: '`[utilisateur]` `[message]` — MP à un seul membre' },
          { name: '/mp-all', value: '`[message]` — MP à TOUS les membres' }
        ).setFooter({ text: '🔒 Réservé aux administrateurs' }),

        fun: new EmbedBuilder().setTitle('🎮 Fun').setColor(0xFF69B4).addFields(
          { name: '/fun 8ball', value: '`[question]` — Boule magique' },
          { name: '/fun pileouface', value: 'Lance une pièce' },
          { name: '/fun de', value: '`[faces]` — Lance un dé' },
          { name: '/fun rps', value: '`[choix]` — Pierre feuille ciseaux' },
          { name: '/fun random', value: 'Membre aléatoire du serveur' }
        ).setFooter({ text: '🌍 Accessible à tous' }),

        stats: new EmbedBuilder().setTitle('📊 Statistiques').setColor(0x00FF88).addFields(
          { name: '/stats', value: 'Affiche les statistiques complètes du serveur' }
        ).setFooter({ text: '🌍 Accessible à tous' }),

        infos: new EmbedBuilder().setTitle('📋 Infos Membre').setColor(0xFFD700).addFields(
          { name: '/infos profil', value: '`[utilisateur]` — Voir le profil d\'un membre' },
          { name: '/infos avatar', value: '`[utilisateur]` — Voir l\'avatar en HD' }
        ).setFooter({ text: '🌍 Accessible à tous' }),

        config: new EmbedBuilder().setTitle('⚙️ Configuration').setColor(0xFFAA00).addFields(
          { name: '/config anti-lien', value: '`[on/off]` — Bloquer les liens' },
          { name: '/config anti-spam', value: '`[on/off]` — Bloquer le spam' },
          { name: '/config statut', value: 'Voir la configuration actuelle' }
        ).setFooter({ text: '🔒 Réservé aux modérateurs' }),
      };

      await i.update({ embeds: [embeds[i.values[0]]], components: [menu] });
    });

    collector.on('end', () => interaction.editReply({ components: [] }).catch(() => {}));
  }
};