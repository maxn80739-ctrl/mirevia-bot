const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Commande chargée : /${command.data.name}`);
  }
}

// Anti-spam : stockage temporaire
const spamMap = new Map();

function loadConfig(guildId) {
  const configFile = path.join(__dirname, 'data', 'config.json');
  if (!fs.existsSync(configFile)) return { antiLien: false, antiSpam: false };
  const data = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  return data[guildId] || { antiLien: false, antiSpam: false };
}

client.once('clientReady', () => {
  console.log(`\n🤖 Bot connecté en tant que ${client.user.tag}`);
  console.log(`📡 Présent sur ${client.guilds.cache.size} serveur(s)\n`);
  client.user.setActivity('🛡️ Modération active', { type: 4 });
});

// Gestion des messages (anti-lien + anti-spam)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const cfg = loadConfig(message.guild.id);
  const member = message.member;

  // Ignore les modérateurs
  const ROLES_AUTORISES = [
    '1509491929614647438',
    '1509491929614647435',
    '1509491929614647434',
  ];
  const estModo = member?.roles.cache.some(r => ROLES_AUTORISES.includes(r.id));
  if (estModo) return;

  // ANTI-LIEN
  if (cfg.antiLien) {
    const lienRegex = /(https?:\/\/|www\.|discord\.gg\/)[^\s]+/gi;
    if (lienRegex.test(message.content)) {
      await message.delete().catch(() => {});
      const warn = await message.channel.send(`❌ ${message.author}, les liens sont interdits sur ce serveur !`);
      setTimeout(() => warn.delete().catch(() => {}), 5000);
      return;
    }
  }

  // ANTI-SPAM (5 messages en 3 secondes = mute 5 minutes)
  if (cfg.antiSpam) {
    const key = `${message.guild.id}_${message.author.id}`;
    const now = Date.now();

    if (!spamMap.has(key)) spamMap.set(key, []);
    const timestamps = spamMap.get(key);
    timestamps.push(now);

    // Garde seulement les messages des 3 dernières secondes
    const recent = timestamps.filter(t => now - t < 3000);
    spamMap.set(key, recent);

    if (recent.length >= 5) {
      spamMap.delete(key);
      try {
        await member.timeout(5 * 60 * 1000, 'Anti-spam automatique');
        const warn = await message.channel.send(`🚫 ${message.author} a été mute **5 minutes** pour spam !`);
        setTimeout(() => warn.delete().catch(() => {}), 7000);
      } catch {}
    }
  }
});

// Gestion des slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`❌ Erreur /${interaction.commandName}:`, error);
    const msg = { content: '❌ Une erreur est survenue.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.login(process.env.TOKEN);