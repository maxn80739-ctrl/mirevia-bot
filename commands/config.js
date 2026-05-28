const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { aLeRole } = require('../utils/checkRoles');
const fs = require('fs');
const path = require('path');

const configFile = path.join(__dirname, '..', 'data', 'config.json');

function loadConfig(guildId) {
  if (!fs.existsSync(configFile)) {
    fs.mkdirSync(path.dirname(configFile), { recursive: true });
    fs.writeFileSync(configFile, '{}');
  }
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } catch {
    data = {};
  }
  if (!data[guildId]) data[guildId] = { antiLien: false, antiSpam: false };
  return data;
}

function saveConfig(data) {
  fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('⚙️ Configurer le bot pour le serveur')
    .addSubcommand(sub =>
      sub.setName('anti-lien')
        .setDescription('Activer ou désactiver l\'anti-lien')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Activer ou désactiver')
            .setRequired(true)
            .addChoices(
              { name: '✅ Activer', value: 'on' },
              { name: '❌ Désactiver', value: 'off' }
            )))
    .addSubcommand(sub =>
      sub.setName('anti-spam')
        .setDescription('Activer ou désactiver l\'anti-spam')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Activer ou désactiver')
            .setRequired(true)
            .addChoices(
              { name: '✅ Activer', value: 'on' },
              { name: '❌ Désactiver', value: 'off' }
            )))
    .addSubcommand(sub =>
      sub.setName('statut')
        .setDescription('Voir la configuration actuelle'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!aLeRole(interaction.member))
      return interaction.reply({ content: '❌ Tu n\'as pas la permission.', ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    try {
      const data = loadConfig(guildId);

      if (sub === 'anti-lien') {
        const action = interaction.options.getString('action');
        data[guildId].antiLien = action === 'on';
        saveConfig(data);

        const embed = new EmbedBuilder()
          .setTitle('⚙️ Anti-Lien')
          .setColor(action === 'on' ? 0x00FF88 : 0xFF4444)
          .setDescription(action === 'on'
            ? '✅ Anti-lien **activé**.\nLes liens seront supprimés automatiquement.'
            : '❌ Anti-lien **désactivé**.')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      if (sub === 'anti-spam') {
        const action = interaction.options.getString('action');
        data[guildId].antiSpam = action === 'on';
        saveConfig(data);

        const embed = new EmbedBuilder()
          .setTitle('⚙️ Anti-Spam')
          .setColor(action === 'on' ? 0x00FF88 : 0xFF4444)
          .setDescription(action === 'on'
            ? '✅ Anti-spam **activé**.\nMute auto 5 minutes après 5 messages en 3 secondes.'
            : '❌ Anti-spam **désactivé**.')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      if (sub === 'statut') {
        const cfg = data[guildId];

        const embed = new EmbedBuilder()
          .setTitle('⚙️ Configuration actuelle')
          .setColor(0x5865F2)
          .addFields(
            { name: '🔗 Anti-Lien', value: cfg.antiLien ? '✅ Activé' : '❌ Désactivé', inline: true },
            { name: '🚫 Anti-Spam', value: cfg.antiSpam ? '✅ Activé' : '❌ Désactivé', inline: true }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

    } catch (err) {
      console.error('Erreur config:', err);
      return interaction.reply({ content: '❌ Erreur lors de la sauvegarde de la configuration.', ephemeral: true });
    }
  }
};