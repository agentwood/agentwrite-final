const fs = require('fs');
const path = require('path');

// Read the seed file
const seedPath = path.join(__dirname, '../data/persona-templates.seed.json');
const personas = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Realistic characters that should keep realistic photos
const realisticCharacters = [
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
  'mafia-job-report', // Realistic character
];

// Function to generate waifu anime avatar URL
// Using thiswaifudoesnotexist.net for high-quality waifu anime images
function getWaifuAnimeAvatar(characterId, characterName) {
  // Use character ID as seed for consistency
  const seed = characterId.replace(/-/g, '');
  // thiswaifudoesnotexist.net provides high-quality waifu anime images
  // We'll use a consistent seed based on character ID
  return `https://www.thiswaifudoesnotexist.net/v2/${seed.length > 8 ? seed.substring(0, 8) : seed.padEnd(8, '0')}.jpg`;
}

// Realistic character avatars (keep realistic photos)
const realisticAvatars = {
  'grumpy-old-man': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  'california-surfer': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'sassy-best-friend': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
  'chef-gordon': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'ai-tutor': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'therapy-bot': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'shy-introvert': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face',
  'confident-leader': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  'comedic-relief': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'romantic-partner': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
  'cyberpunk-hacker': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'mafia-job-report': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
};

// Update avatars
let updated = 0;
let realisticCount = 0;
let animeCount = 0;

personas.forEach(persona => {
  if (realisticCharacters.includes(persona.id)) {
    // Keep realistic photos for realistic characters
    if (realisticAvatars[persona.id]) {
      persona.avatarUrl = realisticAvatars[persona.id];
      realisticCount++;
      updated++;
    }
  } else {
    // Use waifu anime style for all other characters
    persona.avatarUrl = getWaifuAnimeAvatar(persona.id, persona.name);
    animeCount++;
    updated++;
  }
});

// Write updated file
fs.writeFileSync(seedPath, JSON.stringify(personas, null, 2));

console.log(`✅ Updated ${updated} avatars`);
console.log(`📊 Realistic: ${realisticCount}, Waifu Anime: ${animeCount}`);
console.log(`\n🎨 All non-realistic characters now use waifu anime style like Talkie AI`);




