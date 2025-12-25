/**
 * Script to generate waifu avatars matching character traits
 * Uses waifu.pics API for fantasy characters, Dicebear for humans
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PERSONAS_FILE = path.join(__dirname, '../data/persona-templates.seed.json');
const OUTPUT_FILE = path.join(__dirname, '../data/persona-templates.seed.json');

// Character to waifu category mapping (waifu.pics categories)
const CHARACTER_TO_CATEGORY = {
  // Fantasy characters - use waifu style
  'wise-mentor': 'waifu', // Generic waifu for now
  'wizard-sage': 'waifu',
  'elf-archer': 'waifu',
  'dragon-rider': 'waifu',
  'necromancer-dark': 'waifu',
  'vampire-noble': 'waifu',
  'samurai-warrior': 'waifu',
  'ninja-assassin': 'waifu',
  'pirate-captain': 'waifu',
  'medieval-knight': 'waifu',
  'space-explorer': 'waifu',
  'robot-companion': 'waifu',
  'cyberpunk-hacker': 'waifu',
  'detective-noir': 'waifu',
  'mysterious-stranger': 'waifu',
  'villain-antagonist': 'waifu',
  'ranger-beast-master': 'waifu',
  'bard-storyteller': 'waifu',
  'gentle-giant': 'waifu',
  'time-traveler': 'waifu',
  'mad-scientist': 'waifu',
  'shaman-spirit': 'waifu',
  'warlord-commander': 'waifu',
  'blood-hunter': 'waifu',
  'artificer-inventor': 'waifu',
  'sorcerer-wild-magic': 'waifu',
  'fighter-champion': 'waifu',
  'warlock-pact': 'waifu',
  'druid-nature': 'waifu',
  'monk-spiritual': 'waifu',
  'cleric-healer': 'waifu',
  'barbarian-warrior': 'waifu',
  'paladin-holy': 'waifu',
  'rogue-thief': 'waifu',
  'ranger-of-the-woods': 'waifu',
  'alchemist-potion-master': 'waifu',
  'tsundere-anime-girl': 'waifu',
  'yandere-obsessive': 'waifu',
  'kuudere-cold': 'waifu',
  'dere-dere-sweet': 'waifu',
};

/**
 * Fetch random waifu image from waifu.pics
 */
function fetchWaifuImage(category = 'waifu') {
  return new Promise((resolve, reject) => {
    const url = `https://api.waifu.pics/sfw/${category}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.url) {
            resolve(json.url);
          } else {
            reject(new Error('No URL in response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Generate avatar URL based on character
 */
async function generateAvatarUrl(persona) {
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
  
  // Fantasy characters - fetch from waifu.pics
  const category = CHARACTER_TO_CATEGORY[persona.id] || 'waifu';
  
  try {
    const imageUrl = await fetchWaifuImage(category);
    return imageUrl;
  } catch (error) {
    console.warn(`  ⚠️  Failed to fetch waifu for ${persona.name}: ${error.message}`);
    // Fallback: Use Dicebear with fantasy seed
    const seed = persona.id.replace(/-/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
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
  let updatedCount = 0;
  
  for (let i = 0; i < personas.length; i++) {
    const persona = personas[i];
    const oldUrl = persona.avatarUrl;
    
    process.stdout.write(`${i + 1}/${personas.length}. ${persona.name}... `);
    
    try {
      const newUrl = await generateAvatarUrl(persona);
      
      if (oldUrl !== newUrl) {
        console.log(`✅ Updated`);
        updatedCount++;
      } else {
        console.log(`ℹ️  No change`);
      }
      
      updated.push({
        ...persona,
        avatarUrl: newUrl,
      });
      
      // Rate limiting - wait 300ms between requests
      if (i < personas.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      // Keep old URL on error
      updated.push(persona);
    }
  }
  
  // Write updated file (backup original first)
  const backupFile = PERSONAS_FILE.replace('.json', '.backup.json');
  fs.copyFileSync(PERSONAS_FILE, backupFile);
  console.log(`\n📦 Backup created: ${backupFile}`);
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updated, null, 2));
  console.log(`\n✅ Updated ${updatedCount} personas`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log('\n⚠️  Note: waifu.pics provides random images.');
  console.log('   For consistent avatars per character, consider:');
  console.log('   1. Using a seed-based generator');
  console.log('   2. Hosting your own images');
  console.log('   3. Using wwaifu.github.io manually and uploading results');
}

// Run the script
updatePersonaAvatars().catch(console.error);



