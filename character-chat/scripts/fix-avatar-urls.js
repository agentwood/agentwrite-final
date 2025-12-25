/**
 * Fix avatar URLs to use character names properly
 * For anime/fantasy characters: Use character name as prompt
 * For realistic characters: Use character name as seed
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/persona-templates.seed.json');
const personas = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Characters that should use anime/waifu style
const ANIME_CATEGORIES = ['fiction', 'adventure', 'horror', 'romance'];
const ANIME_KEYWORDS = ['war', 'commander', 'warrior', 'samurai', 'vampire', 'pirate', 
  'bard', 'wizard', 'mage', 'sorcerer', 'elf', 'dragon', 'fairy', 'knight', 
  'adventurer', 'explorer', 'fantasy', 'magical', 'ancient', 'swashbuckling'];

function shouldUseAnime(name, category, archetype) {
  const nameLower = name.toLowerCase();
  const archLower = (archetype || '').toLowerCase();
  
  // Check category
  if (ANIME_CATEGORIES.includes(category)) {
    return true;
  }
  
  // Check keywords in name
  if (ANIME_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return true;
  }
  
  // Check archetype
  if (archLower.includes('fantasy') || archLower.includes('magical') || 
      archLower.includes('adventure') || archLower.includes('warrior')) {
    return true;
  }
  
  return false;
}

// Generate avatar URL using character name
function generateAvatarUrl(name, category, archetype) {
  // Create seed from character name (use key words)
  // "War Commander" -> "warcommander"
  // "Grumpy Old Man" -> "grumpyoldman"
  const seed = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 20);
  
  if (shouldUseAnime(name, category, archetype)) {
    // Use waifu.pics with character name as identifier
    return `https://i.waifu.pics/${seed}.jpg`;
  } else {
    // Use dicebear for realistic characters
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
  }
}

// Update all personas
personas.forEach((persona) => {
  persona.avatarUrl = generateAvatarUrl(
    persona.name, 
    persona.category, 
    persona.archetype
  );
});

// Write updated data
fs.writeFileSync(dataPath, JSON.stringify(personas, null, 2));

console.log(`✅ Updated avatar URLs for ${personas.length} personas`);

// Show examples
console.log('\nExample avatar URLs:');
personas.slice(0, 5).forEach(p => {
  console.log(`  ${p.name}: ${p.avatarUrl}`);
});




