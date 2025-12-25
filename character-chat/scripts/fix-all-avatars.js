/**
 * Fix all avatar URLs:
 * - Fantasy characters: waifu.pics
 * - Realistic characters: human face generators (thispersondoesnotexist.net style)
 * - Generic/miscellaneous: Dicebear Avataaars (minimalist cartoon)
 */

const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '../data/persona-templates.seed.json');

function generateWaifuUrl(characterId, characterName) {
  const seed = (characterId || characterName.toLowerCase().replace(/[^a-z0-9]/g, '')).substring(0, 20);
  return `https://i.waifu.pics/${seed}.jpg`;
}

function generateHumanFaceUrl(characterId, characterName) {
  // Using Dicebear Personas for realistic human faces
  const seed = (characterId || characterName.toLowerCase().replace(/[^a-z0-9]/g, '')).substring(0, 20);
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
}

function generateCartoonAvatarUrl(characterId, characterName) {
  // Using Dicebear Avataaars for minimalist cartoon style
  const seed = (characterId || characterName.toLowerCase().replace(/[^a-z0-9]/g, '')).substring(0, 20);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
}

function updateAvatars() {
  const personas = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  
  let updated = 0;
  
  personas.forEach((persona) => {
    const category = persona.category?.toLowerCase() || '';
    const id = persona.id || persona.seedId || persona.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const name = persona.name || '';
    
    let newAvatarUrl;
    
    // Fantasy characters (fantasy, fiction, adventure, horror)
    if (['fantasy', 'fiction', 'adventure', 'horror'].includes(category)) {
      newAvatarUrl = generateWaifuUrl(id, name);
    }
    // Realistic characters (comedy, support, educational with real people)
    else if (['comedy', 'support', 'educational'].includes(category)) {
      // Check if it's a "real person" character (old, cultural, etc.)
      const isRealPerson = persona.archetype?.toLowerCase().includes('old') ||
                           persona.archetype?.toLowerCase().includes('veteran') ||
                           persona.archetype?.toLowerCase().includes('granny') ||
                           persona.archetype?.toLowerCase().includes('karen') ||
                           persona.archetype?.toLowerCase().includes('tribal') ||
                           persona.archetype?.toLowerCase().includes('shaman') ||
                           persona.archetype?.toLowerCase().includes('merchant') ||
                           persona.archetype?.toLowerCase().includes('master') ||
                           persona.archetype?.toLowerCase().includes('leader') ||
                           persona.archetype?.toLowerCase().includes('seafarer') ||
                           name.toLowerCase().includes('karen') ||
                           name.toLowerCase().includes('granny') ||
                           name.toLowerCase().includes('veteran') ||
                           name.toLowerCase().includes('tribal') ||
                           name.toLowerCase().includes('shaman');
      
      if (isRealPerson) {
        newAvatarUrl = generateHumanFaceUrl(id, name);
      } else {
        // Other comedy/support/educational use cartoon
        newAvatarUrl = generateCartoonAvatarUrl(id, name);
      }
    }
    // Generic/miscellaneous (everything else) - use minimalist cartoon
    else {
      newAvatarUrl = generateCartoonAvatarUrl(id, name);
    }
    
    // Only update if different
    if (persona.avatarUrl !== newAvatarUrl) {
      persona.avatarUrl = newAvatarUrl;
      updated++;
    }
  });
  
  // Save updated file
  fs.writeFileSync(SEED_FILE, JSON.stringify(personas, null, 2));
  
  console.log(`✅ Updated ${updated} avatar URLs`);
  console.log(`📊 Breakdown:`);
  
  const fantasy = personas.filter(p => ['fantasy', 'fiction', 'adventure', 'horror'].includes(p.category?.toLowerCase()));
  const realistic = personas.filter(p => {
    const cat = p.category?.toLowerCase();
    if (!['comedy', 'support', 'educational'].includes(cat)) return false;
    const arch = p.archetype?.toLowerCase() || '';
    const nm = p.name?.toLowerCase() || '';
    return arch.includes('old') || arch.includes('veteran') || arch.includes('granny') || 
           arch.includes('karen') || arch.includes('tribal') || arch.includes('shaman') ||
           nm.includes('karen') || nm.includes('granny') || nm.includes('veteran');
  });
  const cartoon = personas.filter(p => {
    const cat = p.category?.toLowerCase();
    return !['fantasy', 'fiction', 'adventure', 'horror'].includes(cat) && 
           !(realistic.includes(p));
  });
  
  console.log(`   Fantasy (waifu): ${fantasy.length}`);
  console.log(`   Realistic (human): ${realistic.length}`);
  console.log(`   Generic (cartoon): ${cartoon.length}`);
  
  console.log(`\n💡 Next: Run 'npm run db:seed' to update database`);
}

updateAvatars();




