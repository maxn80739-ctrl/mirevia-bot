const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Vérifie si le dossier commands existe
if (!fs.existsSync(commandsPath)) {
  console.error('❌ Le dossier "commands" est introuvable !');
  console.error('📁 Chemin cherché :', commandsPath);
  process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

console.log('📂 Dossier commands trouvé');
console.log('📄 Fichiers trouvés :', commandFiles);

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
    console.log(`✅ Commande chargée : ${command.data.name}`);
  } else {
    console.log(`⚠️ Fichier ignoré (pas de .data) : ${file}`);
  }
}

console.log(`\n🔄 Déploiement de ${commands.length} commande(s)...`);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, '1509491929136762931'),
      { body: commands }
    );
    console.log('✅ Commandes déployées !');
  } catch (error) {
    console.error('❌ Erreur :', error);
  }
})();