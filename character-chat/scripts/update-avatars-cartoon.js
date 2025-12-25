const fs = require('fs');
const path = require('path');

// Read the seed file
const seedPath = path.join(__dirname, '../data/persona-templates.seed.json');
const personas = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Human/realistic characters that should use minimalist cartoon style
const humanCharacters = [
  'grumpy-old-man',
  'california-surfer',
  'sassy-best-friend',
  'chef-gordon',
  'ai-tutor',
  'therapy-bot',
  'shy-introvert',
  'confident-leader',
  'comedic-relief',
  'romantic-partner',
  'cyberpunk-hacker',
  'mafia-job-report',
];

// Function to generate minimalist cartoon avatar URL (like the template image)
// Using Dicebear's "avataaars" style for minimalist cartoon aesthetic
function getMinimalistCartoonAvatar(characterId, characterName) {
  // Use character ID as seed for consistency
  const seed = characterId.replace(/-/g, '');
  // Dicebear avataaars provides minimalist cartoon style
  // Similar to the template: simple lines, limited colors, clean aesthetic
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
}

// Function to generate waifu anime avatar URL for fantasy characters
function getWaifuAnimeAvatar(characterId, characterName) {
  const seed = characterId.replace(/-/g, '');
  return `https://www.thiswaifudoesnotexist.net/v2/${seed.length > 8 ? seed.substring(0, 8) : seed.padEnd(8, '0')}.jpg`;
}

// Update avatars
let updated = 0;
let humanCount = 0;
let fantasyCount = 0;

personas.forEach(persona => {
  if (humanCharacters.includes(persona.id)) {
    // Use minimalist cartoon style for human/realistic characters
    persona.avatarUrl = getMinimalistCartoonAvatar(persona.id, persona.name);
    humanCount++;
    updated++;
  } else {
    // Use waifu anime style for all fantasy characters
    persona.avatarUrl = getWaifuAnimeAvatar(persona.id, persona.name);
    fantasyCount++;
    updated++;
  }
});

// Write updated file
fs.writeFileSync(seedPath, JSON.stringify(personas, null, 2));

console.log(`✅ Updated ${updated} avatars`);
console.log(`📊 Human (Minimalist Cartoon): ${humanCount}, Fantasy (Waifu Anime): ${fantasyCount}`);
console.log(`\n🎨 Human characters now use minimalist cartoon style (template style)`);
console.log(`🎨 Fantasy characters use waifu anime style`);




