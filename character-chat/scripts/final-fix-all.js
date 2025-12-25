/**
 * Final comprehensive fix for all issues:
 * 1. Fix all voice names to valid Gemini voices (lowercase)
 * 2. Ensure categories are diverse
 * 3. Fix creator usernames
 * 4. Fix avatar URLs to use character names properly
 * 5. Rename "Warlord Commander" to "War Commander" if needed
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/persona-templates.seed.json');
const personas = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Valid Gemini voices (must be lowercase)
const VALID_VOICES = ['achernar', 'achird', 'algenib', 'algieba', 'alnilam', 'aoede', 'autonoe',
  'callirrhoe', 'charon', 'despina', 'enceladus', 'erinome', 'fenrir',
  'gacrux', 'iapetus', 'kore', 'laomedeia', 'leda', 'orus', 'puck',
  'pulcherrima', 'rasalgethi', 'sadachbia', 'sadaltager', 'schedar',
  'sulafat', 'umbriel', 'vindemiatrix', 'zephyr', 'zubenelgenubi'];

// Voice mapping - ensure all map to valid voices
const VOICE_MAP = {
  'puck': 'puck',
  'kore': 'kore',
  'charon': 'charon',
  'aoede': 'aoede',
  'fenrir': 'fenrir',
  'achernar': 'achernar',
  'achird': 'achird',
  'algenib': 'algenib',
  'algieba': 'algieba',
  'alnilam': 'alnilam',
  'autonoe': 'autonoe',
  'callirrhoe': 'callirrhoe',
  'despina': 'despina',
  'enceladus': 'enceladus',
  'erinome': 'erinome',
  'gacrux': 'gacrux',
  'iapetus': 'iapetus',
  'laomedeia': 'laomedeia',
  'leda': 'leda',
  'orus': 'orus',
  'pulcherrima': 'pulcherrima',
  'rasalgethi': 'rasalgethi',
  'sadachbia': 'sadachbia',
  'sadaltager': 'sadaltager',
  'schedar': 'schedar',
  'sulafat': 'sulafat',
  'umbriel': 'umbriel',
  'vindemiatrix': 'vindemiatrix',
  'zephyr': 'zephyr',
  'zubenelgenubi': 'zubenelgenubi',
};

// Better category distribution
function assignCategory(persona, index) {
  const id = persona.id.toLowerCase();
  const name = persona.name.toLowerCase();
  const archetype = persona.archetype?.toLowerCase() || '';
  const tagline = (persona.tagline || '').toLowerCase();
  
  // Educational (only teachers/tutors, not mentors)
  if ((id.includes('teacher') || id.includes('tutor') || name.includes('teacher') || 
       name.includes('tutor')) && !id.includes('mentor')) {
    return 'educational';
  }
  
  // Support (only therapists/listeners)
  if (id.includes('therapist') || id.includes('listener') || name.includes('therapist')) {
    return 'support';
  }
  
  // Comedy
  if (id.includes('grumpy') || id.includes('surfer') || id.includes('sassy') ||
      archetype.includes('comedic') || tagline.includes('funny') || tagline.includes('laugh')) {
    return 'comedy';
  }
  
  // Adventure (commanders, pirates, adventurers, mentors, detectives)
  if (id.includes('commander') || id.includes('pirate') || id.includes('adventurer') ||
      id.includes('mentor') || id.includes('detective') || id.includes('explorer') ||
      name.includes('commander') || name.includes('pirate') || name.includes('adventurer') ||
      name.includes('mentor') || name.includes('detective')) {
    return 'adventure';
  }
  
  // Romance
  if (id.includes('girlfriend') || id.includes('crush') || id.includes('partner') ||
      id.includes('romance') || tagline.includes('love') || tagline.includes('together')) {
    return 'romance';
  }
  
  // Horror
  if (id.includes('vampire') || id.includes('yandere') || name.includes('vampire') ||
      archetype.includes('horror') || tagline.includes('dark')) {
    return 'horror';
  }
  
  // Fiction (fantasy/magical only)
  if (id.includes('wizard') || id.includes('mage') || id.includes('sorcerer') ||
      id.includes('elf') || id.includes('dragon') || name.includes('wizard') ||
      name.includes('magic') || archetype.includes('fantasy')) {
    return 'fiction';
  }
  
  // Distribute remaining evenly
  const categories = ['comedy', 'adventure', 'romance', 'horror', 'fiction', 'educational', 'support'];
  return categories[index % categories.length];
}

// Generate creator username from character name
function generateCreatorUsername(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 20) || 'character';
}

// Generate avatar URL - use character name as identifier
function generateAvatarUrl(name, category, archetype) {
  // Create identifier from character name
  // "War Commander" -> "warcommander"
  const identifier = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 20);
  
  // Anime/waifu for fantasy characters
  const nameLower = name.toLowerCase();
  const archLower = (archetype || '').toLowerCase();
  const useAnime = category === 'fiction' || category === 'adventure' || category === 'horror' ||
    category === 'romance' || nameLower.includes('war') || nameLower.includes('commander') ||
    nameLower.includes('warrior') || nameLower.includes('samurai') || nameLower.includes('vampire') ||
    nameLower.includes('pirate') || nameLower.includes('bard') || nameLower.includes('wizard') ||
    nameLower.includes('knight') || nameLower.includes('adventurer') || archLower.includes('fantasy');
  
  if (useAnime) {
    return `https://i.waifu.pics/${identifier}.jpg`;
  } else {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${identifier}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
  }
}

// Update all personas
personas.forEach((persona, index) => {
  // 1. Fix voice name (ensure lowercase and valid)
  let voiceName = (persona.voice?.voiceName || persona.voiceName || 'puck').toLowerCase();
  if (!VALID_VOICES.includes(voiceName)) {
    // Map to valid voice based on character traits
    const nameLower = persona.name.toLowerCase();
    if (nameLower.includes('old') || nameLower.includes('wise') || nameLower.includes('mentor')) {
      voiceName = 'charon'; // Deep, authoritative
    } else if (nameLower.includes('surfer') || nameLower.includes('chill')) {
      voiceName = 'puck'; // Energetic, casual
    } else if (nameLower.includes('war') || nameLower.includes('commander')) {
      voiceName = 'fenrir'; // Strong, confident
    } else {
      voiceName = 'puck'; // Default
    }
  }
  persona.voiceName = voiceName;
  if (persona.voice) {
    persona.voice.voiceName = voiceName;
  }
  
  // 2. Fix category (better distribution)
  persona.category = assignCategory(persona, index);
  
  // 3. Fix creator username
  persona.creator = generateCreatorUsername(persona.name);
  
  // 4. Fix avatar URL (use character name)
  persona.avatarUrl = generateAvatarUrl(persona.name, persona.category, persona.archetype);
  
  // 5. Rename "Warlord Commander" to "War Commander" if it exists
  if (persona.name === 'Warlord Commander') {
    persona.name = 'War Commander';
    persona.id = 'war-commander';
  }
});

// Write updated data
fs.writeFileSync(dataPath, JSON.stringify(personas, null, 2));

console.log(`✅ Updated ${personas.length} personas`);
console.log(`✅ Fixed voice names (all lowercase, valid)`);
console.log(`✅ Diversified categories`);
console.log(`✅ Added creator usernames`);
console.log(`✅ Updated avatar URLs (using character names)`);

// Show category distribution
const categories = {};
personas.forEach(p => {
  categories[p.category] = (categories[p.category] || 0) + 1;
});
console.log('\nCategory distribution:');
Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

// Show voice distribution
const voices = {};
personas.forEach(p => {
  voices[p.voiceName] = (voices[p.voiceName] || 0) + 1;
});
console.log('\nVoice distribution:');
Object.entries(voices).sort((a, b) => b[1] - a[1]).forEach(([voice, count]) => {
  console.log(`  ${voice}: ${count}`);
});

// Show examples
console.log('\nExample characters:');
personas.slice(0, 3).forEach(p => {
  console.log(`  ${p.name}:`);
  console.log(`    Category: ${p.category}`);
  console.log(`    Voice: ${p.voiceName}`);
  console.log(`    Creator: @${p.creator}`);
  console.log(`    Avatar: ${p.avatarUrl}`);
});




