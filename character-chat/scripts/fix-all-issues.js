/**
 * Script to fix all issues:
 * 1. Update voice names to valid Gemini voices
 * 2. Diversify categories
 * 3. Add creator usernames based on character names
 * 4. Update avatar URLs to use character names
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/persona-templates.seed.json');
const personas = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Valid Gemini voices
const VALID_VOICES = ['achernar', 'achird', 'algenib', 'algieba', 'alnilam', 'aoede', 'autonoe',
  'callirrhoe', 'charon', 'despina', 'enceladus', 'erinome', 'fenrir',
  'gacrux', 'iapetus', 'kore', 'laomedeia', 'leda', 'orus', 'puck',
  'pulcherrima', 'rasalgethi', 'sadachbia', 'sadaltager', 'schedar',
  'sulafat', 'umbriel', 'vindemiatrix', 'zephyr', 'zubenelgenubi'];

// Voice mapping (old -> new)
const VOICE_MAP = {
  'Puck': 'puck',
  'Kore': 'kore',
  'Charon': 'charon',
  'Aoede': 'aoede',
  'Fenrir': 'fenrir',
  'Emily': 'kore',
  'Sarah': 'aoede',
  'Jennifer': 'pulcherrima',
  'Lisa': 'kore',
  'James': 'charon',
  'Michael': 'fenrir',
  'David': 'charon',
  'Robert': 'puck',
  'Alex': 'zephyr',
};

// Category mapping - diversify categories
const CATEGORY_MAP = {
  // Educational
  'wise-mentor': 'educational',
  'patient-teacher': 'educational',
  'science-tutor': 'educational',
  
  // Support
  'empathetic-therapist': 'support',
  'best-friend': 'support',
  'nervous-student': 'support',
  
  // Fiction (fantasy)
  'wise-mentor': 'fiction',
  'ancient-vampire': 'fiction',
  'swashbuckling-pirate': 'fiction',
  'gentle-giant': 'fiction',
  'charismatic-bard': 'fiction',
  'war-commander': 'fiction',
  'detective-noir': 'fiction',
  
  // Comedy
  'grumpy-old-man': 'comedy',
  'california-surfer': 'comedy',
  'sassy-best-friend': 'comedy',
  
  // Romance
  'yandere-girlfriend': 'romance',
  'tsundere-crush': 'romance',
  'caring-partner': 'romance',
  
  // Adventure
  'interstellar-adventurer': 'adventure',
  'swashbuckling-pirate': 'adventure',
  
  // Horror
  'ancient-vampire': 'horror',
  'yandere-girlfriend': 'horror',
};

// Generate creator username from character name
function generateCreatorUsername(name) {
  // Convert "Grumpy Old Man Across the Street" -> "grumpyoldman"
  // Convert "War Commander" -> "warcommander"
  const username = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 20);
  return username || 'character';
}

// Generate avatar URL using character name (as prompt for anime generator)
function generateAvatarUrl(name, category) {
  // Extract key words from character name for image generation
  // "War Commander" -> use "War Commander" as the prompt
  // "Grumpy Old Man" -> use "Grumpy Old Man" as the prompt
  
  // For fantasy/fiction/adventure/horror characters, use waifu anime style
  // Use character name directly as the image identifier
  if (category === 'fiction' || category === 'adventure' || category === 'horror' || 
      category === 'romance' || name.toLowerCase().includes('vampire') || 
      name.toLowerCase().includes('pirate') || name.toLowerCase().includes('commander') ||
      name.toLowerCase().includes('bard') || name.toLowerCase().includes('wizard') ||
      name.toLowerCase().includes('knight') || name.toLowerCase().includes('adventurer')) {
    // Use character name as seed for waifu generator
    const seed = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    return `https://i.waifu.pics/${seed}.jpg`;
  }
  
  // For realistic characters (comedy, educational, support), use dicebear
  const seed = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
}

// Update categories based on character traits - Better diversification
function assignCategory(persona) {
  const id = persona.id.toLowerCase();
  const name = persona.name.toLowerCase();
  const archetype = persona.archetype?.toLowerCase() || '';
  const tagline = (persona.tagline || '').toLowerCase();
  
  // Educational (prioritize)
  if (id.includes('teacher') || id.includes('mentor') || id.includes('tutor') || 
      id.includes('educator') || name.includes('teacher') || name.includes('mentor') ||
      archetype.includes('educator') || archetype.includes('mentor') ||
      tagline.includes('learn') || tagline.includes('teach') || tagline.includes('educate')) {
    return 'educational';
  }
  
  // Best friend -> support, but limit
  if (id.includes('best-friend') && !id.includes('sassy')) {
    return 'support';
  }
  
  // Comedy (prioritize)
  if (id.includes('grumpy') || id.includes('surfer') || id.includes('sassy') ||
      id.includes('comedic') || name.includes('grumpy') || name.includes('surfer') ||
      archetype.includes('comedic') || archetype.includes('funny') ||
      tagline.includes('funny') || tagline.includes('laugh') || tagline.includes('comedy')) {
    return 'comedy';
  }
  
  // Adventure (prioritize)
  if (id.includes('adventurer') || id.includes('pirate') || id.includes('commander') ||
      id.includes('explorer') || name.includes('adventurer') || name.includes('pirate') ||
      name.includes('commander') || name.includes('explorer') ||
      archetype.includes('adventure') || archetype.includes('action') ||
      tagline.includes('adventure') || tagline.includes('explore') || tagline.includes('journey')) {
    return 'adventure';
  }
  
  // Romance (prioritize)
  if (id.includes('girlfriend') || id.includes('crush') || id.includes('partner') ||
      id.includes('romance') || name.includes('girlfriend') || name.includes('crush') ||
      archetype.includes('romance') || archetype.includes('love') ||
      tagline.includes('love') || tagline.includes('romance') || tagline.includes('together')) {
    return 'romance';
  }
  
  // Horror (prioritize)
  if (id.includes('vampire') || id.includes('yandere') || id.includes('horror') ||
      name.includes('vampire') || name.includes('dark') ||
      archetype.includes('horror') || archetype.includes('dark') ||
      tagline.includes('dark') || tagline.includes('horror') || tagline.includes('scary')) {
    return 'horror';
  }
  
  // Fiction (only for clearly fantasy/magical characters - limit to ~10)
  if ((id.includes('wizard') || id.includes('mage') || id.includes('sorcerer') ||
      id.includes('elf') || id.includes('dragon') || id.includes('fairy') ||
      name.includes('wizard') || name.includes('mage') || name.includes('magic') ||
      archetype.includes('fantasy') || archetype.includes('magical') ||
      tagline.includes('magic') || tagline.includes('fantasy') || tagline.includes('spell')) &&
      !id.includes('mentor') && !id.includes('bard')) { // Mentors/bards can be adventure
    return 'fiction';
  }
  
  // Detective/Noir -> adventure
  if (id.includes('detective') || id.includes('noir') || id.includes('mystery')) {
    return 'adventure';
  }
  
  // Mentors -> adventure (more interesting than educational)
  if (id.includes('mentor') || name.includes('mentor') || archetype.includes('mentor')) {
    return 'adventure';
  }
  
  // Bards -> adventure
  if (id.includes('bard') || name.includes('bard')) {
    return 'adventure';
  }
  
  // If still unassigned, distribute evenly across all categories
  const categories = ['educational', 'support', 'comedy', 'adventure', 'romance', 'horror', 'fiction'];
  // Use character index for even distribution
  const charIndex = personas.findIndex(p => p.id === persona.id);
  return categories[charIndex % categories.length];
}

// Update all personas
personas.forEach((persona, index) => {
  // 1. Fix voice name
  const currentVoice = persona.voice?.voiceName || 'puck';
  persona.voiceName = VOICE_MAP[currentVoice] || currentVoice.toLowerCase();
  if (persona.voice) {
    persona.voice.voiceName = persona.voiceName;
  }
  
  // 2. Fix category
  persona.category = assignCategory(persona);
  
  // 3. Add creator username
  persona.creator = generateCreatorUsername(persona.name);
  
  // 4. Update avatar URL
  persona.avatarUrl = generateAvatarUrl(persona.name, persona.category);
});

// Write updated data
fs.writeFileSync(dataPath, JSON.stringify(personas, null, 2));

console.log(`✅ Updated ${personas.length} personas`);
console.log(`✅ Fixed voice names`);
console.log(`✅ Diversified categories`);
console.log(`✅ Added creator usernames`);
console.log(`✅ Updated avatar URLs`);

// Show category distribution
const categories = {};
personas.forEach(p => {
  categories[p.category] = (categories[p.category] || 0) + 1;
});
console.log('\nCategory distribution:');
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

