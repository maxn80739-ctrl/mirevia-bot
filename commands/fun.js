
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fun')
    .setDescription('🎮 Commandes fun !')
    .addSubcommand(sub =>
      sub.setName('8ball')
        .setDescription('Pose une question à la boule magique')
        .addStringOption(opt =>
          opt.setName('question').setDescription('Ta question').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('pileouface')
        .setDescription('Lance une pièce'))
    .addSubcommand(sub =>
      sub.setName('de')
        .setDescription('Lance un dé')
        .addIntegerOption(opt =>
          opt.setName('faces').setDescription('Nombre de faces (défaut: 6)').setRequired(false).setMinValue(2).setMaxValue(100)))
    .addSubcommand(sub =>
      sub.setName('rps')
        .setDescription('Pierre, feuille, ciseaux contre le bot')
        .addStringOption(opt =>
          opt.setName('choix')
            .setDescription('Ton choix')
            .setRequired(true)
            .addChoices(
              { name: '🪨 Pierre', value: 'pierre' },
              { name: '📄 Feuille', value: 'feuille' },
              { name: '✂️ Ciseaux', value: 'ciseaux' }
            )))
    .addSubcommand(sub =>
      sub.setName('random')
        .setDescription('Choisit un membre aléatoire du serveur')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === '8ball') {
      const question = interaction.options.getString('question');
      const reponses = [
        '✅ Oui, absolument !',
        '✅ C\'est certain.',
        '✅ Sans aucun doute.',
        '✅ Tu peux compter dessus.',
        '🤔 C\'est probable.',
        '🤔 Les signes pointent vers oui.',
        '🤔 Je ne suis pas sûr...',
        '🤔 Réessaie plus tard.',
        '❌ Je ne pense pas.',
        '❌ Mes sources disent non.',
        '❌ Les perspectives ne sont pas bonnes.',
        '❌ Absolument pas.',
      ];
      const rep = reponses[Math.floor(Math.random() * reponses.length)];
      const embed = new EmbedBuilder()
        .setTitle('🎱 Boule Magique')
        .setColor(0x5865F2)
        .addFields(
          { name: '❓ Question', value: question },
          { name: '🎱 Réponse', value: rep }
        )
        .setFooter({ text: `Demandé par ${interaction.user.tag}` })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'pileouface') {
      const resultat = Math.random() < 0.5 ? '🪙 Pile !' : '🪙 Face !';
      const embed = new EmbedBuilder()
        .setTitle('🪙 Pile ou Face')
        .setColor(0xFFD700)
        .setDescription(`**${resultat}**`)
        .setFooter({ text: `Lancé par ${interaction.user.tag}` })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'de') {
      const faces = interaction.options.getInteger('faces') || 6;
      const resultat = Math.floor(Math.random() * faces) + 1;
      const embed = new EmbedBuilder()
        .setTitle('🎲 Lancer de dé')
        .setColor(0xFF6B6B)
        .setDescription(`Tu as lancé un **d${faces}** et obtenu : **${resultat}**`)
        .setFooter({ text: `Lancé par ${interaction.user.tag}` })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'rps') {
      const choix = interaction.options.getString('choix');
      const options = ['pierre', 'feuille', 'ciseaux'];
      const emojis = { pierre: '🪨', feuille: '📄', ciseaux: '✂️' };
      const botChoix = options[Math.floor(Math.random() * options.length)];
      let resultat;
      if (choix === botChoix) resultat = '🤝 Égalité !';
      else if (
        (choix === 'pierre' && botChoix === 'ciseaux') ||
        (choix === 'feuille' && botChoix === 'pierre') ||
        (choix === 'ciseaux' && botChoix === 'feuille')
      ) resultat = '🏆 Tu as gagné !';
      else resultat = '😈 Le bot a gagné !';
      const embed = new EmbedBuilder()
        .setTitle('🪨📄✂️ Pierre, Feuille, Ciseaux')
        .setColor(0x00FF88)
        .addFields(
          { name: 'Ton choix', value: `${emojis[choix]} ${choix}`, inline: true },
          { name: 'Choix du bot', value: `${emojis[botChoix]} ${botChoix}`, inline: true },
          { name: 'Résultat', value: resultat }
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'random') {
      const members = await interaction.guild.members.fetch();
      const humains = members.filter(m => !m.user.bot);
      const random = humains.random();
      const embed = new EmbedBuilder()
        .setTitle('🎰 Membre Aléatoire')
        .setColor(0xFF69B4)
        .setDescription(`Le sort a désigné... **${random.user.tag}** !`)
        .setThumbnail(random.user.displayAvatarURL())
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
  }
};