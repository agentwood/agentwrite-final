/**
 * Script to generate waifu avatars using waifu.im API
 * Matches character traits and appearance
 * Falls back to wwaifu.github.io style if needed
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PERSONAS_FILE = path.join(__dirname, '../data/persona-templates.seed.json');
const OUTPUT_FILE = path.join(__dirname, '../data/persona-templates-waifu-updated.json');

// Character to waifu tag mapping (using waifu.im tags)
const CHARACTER_TO_TAGS = {
  // Fantasy characters
  'wise-mentor': ['sage', 'wizard', 'elder'],
  'wizard-sage': ['wizard', 'magic', 'sage'],
  'elf-archer': ['elf', 'archer', 'fantasy'],
  'dragon-rider': ['dragon', 'rider', 'fantasy'],
  'necromancer-dark': ['gothic', 'dark', 'magic'],
  'vampire-noble': ['vampire', 'elegant', 'gothic'],
  'samurai-warrior': ['samurai', 'warrior', 'traditional'],
  'ninja-assassin': ['ninja', 'assassin', 'stealth'],
  'pirate-captain': ['pirate', 'captain', 'adventurous'],
  'medieval-knight': ['knight', 'armor', 'medieval'],
  'space-explorer': ['sci-fi', 'space', 'futuristic'],
  'robot-companion': ['android', 'robot', 'futuristic'],
  'cyberpunk-hacker': ['cyberpunk', 'tech', 'futuristic'],
  'detective-noir': ['detective', 'noir', 'mystery'],
  'mysterious-stranger': ['mysterious', 'enigmatic'],
  'villain-antagonist': ['villain', 'dark', 'antagonist'],
  'ranger-beast-master': ['ranger', 'nature', 'beast'],
  'bard-storyteller': ['bard', 'musical', 'storyteller'],
  'gentle-giant': ['gentle', 'kind', 'giant'],
  'time-traveler': ['sci-fi', 'time', 'traveler'],
  'mad-scientist': ['scientist', 'crazy', 'mad'],
  'shaman-spirit': ['shaman', 'spirit', 'mystical'],
  'warlord-commander': ['warlord', 'commander', 'military'],
  'blood-hunter': ['hunter', 'dark', 'blood'],
  'artificer-inventor': ['artificer', 'inventor', 'tech'],
  'sorcerer-wild-magic': ['sorcerer', 'magic', 'wild'],
  'fighter-champion': ['fighter', 'champion', 'warrior'],
  'warlock-pact': ['warlock', 'dark', 'magic'],
  'druid-nature': ['druid', 'nature', 'forest'],
  'monk-spiritual': ['monk', 'spiritual', 'peaceful'],
  'cleric-healer': ['cleric', 'healer', 'holy'],
  'barbarian-warrior': ['barbarian', 'warrior', 'fierce'],
  'paladin-holy': ['paladin', 'holy', 'knight'],
  'rogue-thief': ['rogue', 'thief', 'stealth'],
  'ranger-of-the-woods': ['ranger', 'woods', 'nature'],
  'alchemist-potion-master': ['alchemist', 'potion', 'master'],
  
  // Anime character types
  'tsundere-anime-girl': ['tsundere', 'anime'],
  'yandere-obsessive': ['yandere', 'obsessive'],
  'kuudere-cold': ['kuudere', 'cold'],
  'dere-dere-sweet': ['dere', 'sweet'],
};

/**
 * Fetch waifu image from waifu.im API
 */
function fetchWaifuImage(tags) {
  return new Promise((resolve, reject) => {
    const tagParams = tags.map(tag => `included_tags=${encodeURIComponent(tag)}`).join('&');
    const url = `https://api.waifu.im/search?${tagParams}&height=>=512&many=true`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.images && json.images.length > 0) {
            resolve(json.images[0].url);
          } else {
            reject(new Error('No images found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Generate waifu URL based on character
 */
async function generateWaifuUrl(persona) {
  // Human/realistic characters should use Dicebear
  const isHuman = persona.category === 'realistic' || 
                  persona.name.toLowerCase().includes('old man') ||
                  persona.name.toLowerCase().includes('surfer') ||
                  persona.name.toLowerCase().includes('chef') ||
                  persona.name.toLowerCase().includes('tutor') ||
                  persona.name.toLowerCase().includes('therapy') ||
                  persona.name.toLowerCase().includes('comedic') ||
                  persona.name.toLowerCase().includes('leader') ||
                  persona.name.toLowerCase().includes('introvert') ||
                  persona.name.toLowerCase().includes('romantic') ||
                  persona.name.toLowerCase().includes('sassy') ||
                  persona.name.toLowerCase().includes('best friend');
  
  if (isHuman) {
    // Use Dicebear for human characters
    const seed = persona.id.replace(/-/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
  }
  
  // Fantasy characters - try to fetch from waifu.im
  const tags = CHARACTER_TO_TAGS[persona.id] || ['anime', 'fantasy'];
  
  try {
    const imageUrl = await fetchWaifuImage(tags);
    return imageUrl;
  } catch (error) {
    console.warn(`  ⚠️  Failed to fetch from waifu.im for ${persona.name}, using fallback`);
    // Fallback: Use a seed-based URL that should work
    // For wwaifu.github.io style, we'll use a placeholder
    // In production, you'd want to generate these images and host them
    const seed = persona.id.replace(/-/g, '');
    return `https://api.waifu.pics/sfw/waifu`; // This is a placeholder - waifu.pics doesn't support custom seeds
  }
}

/**
 * Update persona templates with waifu avatars
 */
async function updatePersonaAvatars() {
  console.log('Reading persona templates...');
  const personas = JSON.parse(fs.readFileSync(PERSONAS_FILE, 'utf8'));
  
  console.log(`Found ${personas.length} personas`);
  console.log('Generating waifu avatars...\n');
  
  const updated = [];
  
  for (let i = 0; i < personas.length; i++) {
    const persona = personas[i];
    const oldUrl = persona.avatarUrl;
    
    console.log(`${i + 1}/${personas.length}. ${persona.name}`);
    
    try {
      const newUrl = await generateWaifuUrl(persona);
      
      if (oldUrl !== newUrl) {
        console.log(`   ✅ Updated: ${newUrl}`);
      } else {
        console.log(`   ℹ️  No change needed`);
      }
      
      updated.push({
        ...persona,
        avatarUrl: newUrl,
      });
      
      // Rate limiting - wait 500ms between requests
      if (i < personas.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      // Keep old URL on error
      updated.push(persona);
    }
    
    console.log('');
  }
  
  // Write updated file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updated, null, 2));
  console.log(`\n✅ Updated ${updated.length} personas`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log('\n⚠️  Note: Some images may need manual verification.');
  console.log('   waifu.im API provides random images based on tags.');
  console.log('   For consistent avatars, consider hosting your own images.');
}

// Run the script
updatePersonaAvatars().catch(console.error);
