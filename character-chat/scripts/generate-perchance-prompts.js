/**
 * Generate safe, upper-body (belly-upward) prompts for Perchance.org AI Anime Generator
 * Focuses on portrait/bust shots, non-sexualized, mix of male and female
 */

const fs = require('fs');
const path = require('path');

const PERSONAS_FILE = path.join(__dirname, '../data/persona-templates.seed.json');
const PROMPTS_FILE = path.join(__dirname, '../data/perchance-prompts.json');

/**
 * Determine gender for character (mix of male/female)
 */
function determineGender(persona, index) {
  // Create a balanced mix - alternate or use character traits
  const name = persona.name.toLowerCase();
  
  // Explicitly female characters
  if (name.includes('girl') || name.includes('tsundere') || name.includes('yandere') || 
      name.includes('kuudere') || name.includes('dere') || name.includes('best friend') ||
      name.includes('sassy') || name.includes('romantic partner') || name.includes('shy introvert')) {
    return 'female';
  }
  
  // Explicitly male characters
  if (name.includes('old man') || name.includes('surfer') || name.includes('chef') ||
      name.includes('detective') || name.includes('knight') || name.includes('samurai') ||
      name.includes('wizard') || name.includes('pirate') || name.includes('ninja')) {
    return 'male';
  }
  
  // Alternate for others to create mix
  return index % 2 === 0 ? 'male' : 'female';
}

/**
 * Generate safe Perchance prompt
 */
function generatePrompt(persona, gender) {
  const desc = persona.description || '';
  const name = persona.name;
  
  // Base prompt components
  let prompt = 'anime portrait, ';
  
  // Add gender
  prompt += `${gender}, `;
  
  // Extract key physical details
  if (desc.includes("6'5\"") || desc.includes("6'4\"") || desc.includes("6'3\"")) {
    prompt += 'tall, ';
  } else if (desc.includes("5'2\"") || desc.includes("5'3\"") || desc.includes("5'4\"")) {
    prompt += 'petite, ';
  }
  
  // Character type
  if (name.includes('Wizard') || name.includes('Sage') || name.includes('Mentor')) {
    prompt += 'wise mage, long robes, mystical staff, ';
  } else if (name.includes('Knight') || name.includes('Paladin')) {
    prompt += 'noble warrior, armor, honorable, ';
  } else if (name.includes('Elf')) {
    prompt += 'graceful elf, pointed ears, nature-connected, ';
  } else if (name.includes('Vampire')) {
    prompt += 'elegant vampire, aristocratic, refined, ';
  } else if (name.includes('Ninja') || name.includes('Rogue')) {
    prompt += 'stealthy warrior, masked, mysterious, ';
  } else if (name.includes('Samurai')) {
    prompt += 'honorable samurai, traditional, disciplined, ';
  } else if (name.includes('Pirate')) {
    prompt += 'adventurous pirate, tricorn hat, weathered, ';
  } else if (name.includes('Dragon')) {
    prompt += 'brave dragon rider, wind-swept, adventurous, ';
  } else if (name.includes('Robot') || name.includes('Android')) {
    prompt += 'friendly android, metallic, futuristic, ';
  } else if (name.includes('Cyberpunk') || name.includes('Hacker')) {
    prompt += 'tech-savvy rebel, neon, cyberpunk style, ';
  } else if (name.includes('Space')) {
    prompt += 'interstellar explorer, spacesuit, curious, ';
  } else if (name.includes('Detective')) {
    prompt += 'noir detective, fedora, trench coat, mysterious, ';
  } else if (name.includes('Bard')) {
    prompt += 'charismatic bard, musical, colorful, ';
  } else if (name.includes('Alchemist')) {
    prompt += 'curious alchemist, goggles, potions, ';
  } else if (name.includes('Ranger')) {
    prompt += 'nature guardian, forest, practical, ';
  } else if (name.includes('Cleric') || name.includes('Healer')) {
    prompt += 'compassionate healer, holy symbols, gentle, ';
  } else if (name.includes('Barbarian')) {
    prompt += 'fierce warrior, strong, honorable, ';
  } else if (name.includes('Monk')) {
    prompt += 'peaceful monk, simple robes, calm, ';
  } else if (name.includes('Warlock')) {
    prompt += 'pact-bound mage, dark robes, mysterious, ';
  } else if (name.includes('Druid')) {
    prompt += 'nature druid, living plants, wild, ';
  } else if (name.includes('Sorcerer')) {
    prompt += 'wild magic user, sparks, energetic, ';
  } else if (name.includes('Fighter')) {
    prompt += 'skilled champion, armor, determined, ';
  } else if (name.includes('Artificer')) {
    prompt += 'creative inventor, goggles, tools, ';
  } else if (name.includes('Blood') || name.includes('Hunter')) {
    prompt += 'dark protector, ritual marks, determined, ';
  } else if (name.includes('Warlord') || name.includes('Commander')) {
    prompt += 'military leader, armor, commanding, ';
  } else if (name.includes('Shaman')) {
    prompt += 'mystical shaman, spiritual, connected, ';
  } else if (name.includes('Necromancer')) {
    prompt += 'dark mage, dark robes, pale, mysterious, ';
  } else if (name.includes('Gentle') && name.includes('Giant')) {
    prompt += 'kind giant, large, gentle, ';
  } else if (name.includes('Mad') && name.includes('Scientist')) {
    prompt += 'eccentric scientist, wild hair, goggles, ';
  } else if (name.includes('Time')) {
    prompt += 'temporal explorer, futuristic, curious, ';
  } else if (name.includes('Villain')) {
    prompt += 'theatrical antagonist, dramatic, confident, ';
  } else if (name.includes('Mysterious')) {
    prompt += 'enigmatic stranger, shadowy, mysterious, ';
  } else if (name.includes('Tsundere') || name.includes('Yandere') || name.includes('Kuudere')) {
    prompt += 'anime character, school uniform, expressive, ';
  } else {
    prompt += 'fantasy character, unique, interesting, ';
  }
  
  // Always add: upper body, safe, non-sexualized
  prompt += 'upper body shot, bust portrait, from waist up, safe, non-sexualized, appropriate clothing, professional, clean, wholesome, anime style';
  
  return prompt;
}

/**
 * Generate prompts for all personas
 */
function generatePrompts() {
  console.log('Reading persona templates...');
  const personas = JSON.parse(fs.readFileSync(PERSONAS_FILE, 'utf8'));
  
  console.log(`Found ${personas.length} personas`);
  console.log('Generating Perchance prompts...\n');
  
  const prompts = personas.map((persona, index) => {
    const gender = determineGender(persona, index);
    const prompt = generatePrompt(persona, gender);
    
    console.log(`${index + 1}. ${persona.name} (${gender})`);
    console.log(`   ${prompt}\n`);
    
    return {
      id: persona.id,
      name: persona.name,
      gender: gender,
      prompt: prompt,
      description: persona.description
    };
  });
  
  // Count genders
  const maleCount = prompts.filter(p => p.gender === 'male').length;
  const femaleCount = prompts.filter(p => p.gender === 'female').length;
  
  // Save prompts
  fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2));
  
  console.log(`\n✅ Generated ${prompts.length} prompts`);
  console.log(`   Male: ${maleCount}, Female: ${femaleCount}`);
  console.log(`📁 Saved to: ${PROMPTS_FILE}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Visit https://perchance.org/ai-anime-generator');
  console.log('   2. Use each prompt to generate images');
  console.log('   3. Download and save images to /public/avatars/');
  console.log('   4. Update avatarUrl fields with /avatars/[character-id].jpg');
}

generatePrompts();




