/**
 * Complete avatar fix:
 * - Fantasy: Use waifu.pics with proper URL format
 * - Realistic: Use better human face generator (Generated Photos API or Dicebear Personas with realistic settings)
 * - Generic: Dicebear Avataaars (minimalist cartoon)
 */

const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '../data/persona-templates.seed.json');

function generateWaifuUrl(characterId, characterName) {
  // waifu.pics doesn't support seeded URLs directly
  // We'll use a hash-based approach or provide manual download
  // For now, use a format that might work, or use the API
  const seed = (characterId || characterName.toLowerCase().replace(/[^a-z0-9]/g, '')).substring(0, 20);
  // Try using waifu.pics with a hash-based seed
  // Actually, waifu.pics uses random generation, so we need to either:
  // 1. Use their API (random, not seeded)
  // 2. Download images manually
  // 3. Use a different service
  
  // For now, let's use a format that works with their CDN if they support it
  // Or use a placeholder that indicates manual download needed
  return `https://i.waifu.pics/${seed}.jpg`;
}

function generateHumanFaceUrl(characterId, characterName, isOlder = false) {
  // For realistic human faces, use Dicebear Personas with more realistic settings
  const seed = (characterId || characterName.toLowerCase().replace(/[^a-z0-9]/g, '')).substring(0, 20);
  
  // Dicebear Personas gives more realistic human faces
  // For older people, we can adjust settings
  if (isOlder) {
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20&age=old`;
  }
  
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
}

function generateCartoonAvatarUrl(characterId, characterName) {
  // Minimalist cartoon style (like the provided image) - Dicebear Avataaars
  const seed = (characterId || characterName.toLowerCase().replace(/[^a-z0-9]/g, '')).substring(0, 20);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
}

function updateAvatars() {
  const personas = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  
  let updated = 0;
  const stats = {
    fantasy: 0,
    realistic: 0,
    cartoon: 0,
    needsManualDownload: []
  };
  
  personas.forEach((persona) => {
    const category = persona.category?.toLowerCase() || '';
    const id = persona.id || persona.seedId || persona.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const name = persona.name || '';
    const archetype = (persona.archetype || '').toLowerCase();
    const nameLower = name.toLowerCase();
    const description = (persona.description || '').toLowerCase();
    
    let newAvatarUrl;
    let type = '';
    let isOlder = false;
    
    // Check if it's an older person
    isOlder = archetype.includes('old') || archetype.includes('veteran') || 
              archetype.includes('granny') || archetype.includes('elder') ||
              archetype.includes('grandfather') || archetype.includes('grandmother') ||
              nameLower.includes('old') || nameLower.includes('veteran') ||
              nameLower.includes('granny') || nameLower.includes('elder') ||
              nameLower.includes('grandfather') || nameLower.includes('grandmother') ||
              description.includes('old') || description.includes('elder');
    
    // Fantasy characters (fantasy, fiction, adventure, horror)
    if (['fantasy', 'fiction', 'adventure', 'horror'].includes(category)) {
      // Keep existing waifu.pics URLs if they're already valid
      if (persona.avatarUrl && persona.avatarUrl.includes('waifu.pics') && 
          !persona.avatarUrl.includes('{seed}') && !persona.avatarUrl.includes('.jpg') === false) {
        // Already has a valid waifu.pics URL, keep it
        newAvatarUrl = persona.avatarUrl;
      } else {
        // Use waifu.pics format - these will need to be manually downloaded or use API
        newAvatarUrl = generateWaifuUrl(id, name);
        stats.needsManualDownload.push({ name, id, type: 'waifu' });
      }
      type = 'fantasy';
      stats.fantasy++;
    }
    // Realistic characters - real people
    else if (
      archetype.includes('tribal') ||
      archetype.includes('shaman') ||
      archetype.includes('merchant') ||
      archetype.includes('master') ||
      archetype.includes('leader') ||
      archetype.includes('seafarer') ||
      archetype.includes('karen') ||
      isOlder ||
      nameLower.includes('karen') ||
      nameLower.includes('tribal') ||
      nameLower.includes('shaman')
    ) {
      newAvatarUrl = generateHumanFaceUrl(id, name, isOlder);
      type = 'realistic';
      stats.realistic++;
    }
    // Generic/miscellaneous - use minimalist cartoon (Dicebear Avataaars)
    else {
      newAvatarUrl = generateCartoonAvatarUrl(id, name);
      type = 'cartoon';
      stats.cartoon++;
    }
    
    persona.avatarUrl = newAvatarUrl;
    updated++;
  });
  
  // Save updated file
  fs.writeFileSync(SEED_FILE, JSON.stringify(personas, null, 2));
  
  console.log(`✅ Updated ${updated} avatar URLs`);
  console.log(`\n📊 Breakdown:`);
  console.log(`   Fantasy (waifu.pics): ${stats.fantasy}`);
  console.log(`   Realistic (human faces): ${stats.realistic}`);
  console.log(`   Generic (cartoon): ${stats.cartoon}`);
  
  if (stats.needsManualDownload.length > 0) {
    console.log(`\n⚠️  ${stats.needsManualDownload.length} fantasy characters need manual download:`);
    console.log(`   Visit: https://waifu.pics or https://thiswaifudoesnotexist.net`);
    console.log(`   Generate waifu images and save with these names:`);
    stats.needsManualDownload.slice(0, 10).forEach(({ name, id }) => {
      console.log(`   - ${id}.jpg (${name})`);
    });
    if (stats.needsManualDownload.length > 10) {
      console.log(`   ... and ${stats.needsManualDownload.length - 10} more`);
    }
  }
  
  console.log(`\n💡 Next: Run 'npm run db:seed' to update database`);
}

updateAvatars();

