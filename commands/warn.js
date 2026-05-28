const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { aLeRole } = require('../utils/checkRoles');
const fs = require('fs');
const path = require('path');

const warnsFile = path.join(__dirname, '..', 'data', 'warns.json');

function loadWarns() {
  if (!fs.existsSync(warnsFile)) {
    fs.mkdirSync(path.dirname(warnsFile), { recursive: true });
    fs.writeFileSync(warnsFile, '{}');
  }
  return JSON.parse(fs.readFileSync(warnsFile, 'utf8'));
}

function saveWarns(data) {
  fs.writeFileSync(warnsFile, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un membre')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Membre à avertir').setRequired(true))
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!aLeRole(interaction.member))
      return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.', ephemeral: true });

    const target = interaction.options.getMember('utilisateur');
    const raison = interaction.options.getString('raison');

    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

    const warns = loadWarns();
    const key = `${interaction.guild.id}_${target.id}`;
    if (!warns[key]) warns[key] = [];
    warns[key].push({ raison, moderateur: interaction.user.tag, date: new Date().toISOString() });
    saveWarns(warns);

    await target.send(`⚠️ Tu as reçu un **avertissement** sur **${interaction.guild.name}**.\n📋 Raison : ${raison}\n🔢 Total : **${warns[key].length}**`).catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Avertissement')
      .setColor(0xFFAA00)
      .addFields(
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
        { name: 'Total warns', value: `${warns[key].length}`, inline: true },
        { name: 'Raison', value: raison }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};