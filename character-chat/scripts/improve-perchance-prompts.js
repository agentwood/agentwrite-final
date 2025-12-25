/**
 * Improve Perchance prompts with more character-specific details
 * Focus on upper body, safe, non-sexualized, mix of genders
 */

const fs = require('fs');
const path = require('path');

const PERSONAS_FILE = path.join(__dirname, '../data/persona-templates.seed.json');
const PROMPTS_FILE = path.join(__dirname, '../data/perchance-prompts.json');

/**
 * Determine gender with better logic
 */
function determineGender(persona, index) {
  const name = persona.name.toLowerCase();
  const desc = (persona.description || '').toLowerCase();
  
  // Explicitly female
  if (name.includes('girl') || name.includes('tsundere') || name.includes('yandere') || 
      name.includes('kuudere') || name.includes('dere dere') || name.includes('best friend') ||
      name.includes('sassy') || name.includes('romantic partner') || name.includes('shy introvert') ||
      name.includes('therapy bot') || desc.includes('woman') || desc.includes('she\'s')) {
    return 'female';
  }
  
  // Explicitly male
  if (name.includes('old man') || name.includes('surfer') || name.includes('chef') ||
      name.includes('detective') || name.includes('knight') || name.includes('samurai') ||
      name.includes('wizard') || name.includes('pirate') || name.includes('ninja') ||
      desc.includes('man') || desc.includes('he\'s') || desc.includes('his')) {
    return 'male';
  }
  
  // Balance the rest - alternate
  return index % 2 === 0 ? 'male' : 'female';
}

/**
 * Generate detailed, character-specific prompt
 */
function generateDetailedPrompt(persona, gender) {
  const desc = persona.description || '';
  const name = persona.name;
  
  let prompt = '';
  
  // Start with composition
  prompt += 'anime portrait, ';
  prompt += `${gender}, `;
  prompt += 'upper body shot, bust, from waist up, ';
  
  // Extract physical details from description
  if (desc.includes("6'5\"") || desc.includes("6'4\"") || desc.includes("6'3\"") || desc.includes("6'2\"") || desc.includes("6'1\"")) {
    prompt += 'tall, ';
  } else if (desc.includes("5'2\"") || desc.includes("5'3\"") || desc.includes("5'4\"") || desc.includes("5'5\"")) {
    prompt += 'petite, ';
  }
  
  // Age/appearance
  if (desc.includes('late 60s') || desc.includes('60s') || desc.includes('elderly')) {
    prompt += 'elderly, weathered face, ';
  } else if (desc.includes('mid-20s') || desc.includes('20s') || desc.includes('young')) {
    prompt += 'young adult, ';
  } else if (desc.includes('50s') || desc.includes('middle-aged')) {
    prompt += 'middle-aged, ';
  }
  
  // Hair
  if (desc.includes('silver hair') || desc.includes('white beard')) {
    prompt += 'long silver hair, ';
  } else if (desc.includes('gray hair') || desc.includes('thinning')) {
    prompt += 'gray hair, ';
  } else if (desc.includes('blonde') || desc.includes('bleached')) {
    prompt += 'blonde hair, ';
  } else if (desc.includes('purple') || desc.includes('dyed')) {
    prompt += 'vibrant colored hair, ';
  } else if (desc.includes('twin-tails') || desc.includes('twin tails')) {
    prompt += 'twin-tails hairstyle, ';
  } else if (desc.includes('short') && desc.includes('hair')) {
    prompt += 'short hair, ';
  } else if (desc.includes('topknot')) {
    prompt += 'traditional topknot, ';
  }
  
  // Character-specific details
  if (name.includes('Wizard') || name.includes('Sage') || name.includes('Mentor')) {
    prompt += 'wise mage, long flowing robes, mystical staff, ancient, ';
  } else if (name.includes('Knight') || name.includes('Paladin')) {
    prompt += 'noble warrior, gleaming armor, honorable expression, ';
  } else if (name.includes('Elf')) {
    prompt += 'graceful elf, pointed ears, ethereal features, nature-connected, ';
  } else if (name.includes('Vampire')) {
    prompt += 'elegant vampire, pale flawless skin, aristocratic clothing, refined, ';
  } else if (name.includes('Ninja') || name.includes('Rogue')) {
    prompt += 'stealthy warrior, masked face, dark clothing, mysterious, ';
  } else if (name.includes('Samurai')) {
    prompt += 'honorable samurai, traditional kimono, katana at side, disciplined, ';
  } else if (name.includes('Pirate')) {
    prompt += 'swashbuckling pirate, tricorn hat, weathered coat, charismatic grin, ';
  } else if (name.includes('Dragon')) {
    prompt += 'brave dragon rider, wind-swept hair, adventurous armor, ';
  } else if (name.includes('Robot') || name.includes('Android')) {
    prompt += 'friendly android, metallic skin, LED eyes, futuristic design, ';
  } else if (name.includes('Cyberpunk') || name.includes('Hacker')) {
    prompt += 'tech-savvy rebel, neon-colored hair, cybernetic implants, cyberpunk style, ';
  } else if (name.includes('Space')) {
    prompt += 'interstellar explorer, practical spacesuit, curious expression, ';
  } else if (name.includes('Detective')) {
    prompt += 'hard-boiled detective, fedora hat, trench coat, world-weary, ';
  } else if (name.includes('Bard')) {
    prompt += 'charismatic bard, colorful travel-worn clothing, lute nearby, ';
  } else if (name.includes('Alchemist')) {
    prompt += 'curious alchemist, goggles on head, stained hands, experimental, ';
  } else if (name.includes('Ranger')) {
    prompt += 'nature guardian, practical forest clothing, weather-beaten, ';
  } else if (name.includes('Cleric') || name.includes('Healer')) {
    prompt += 'compassionate healer, robes with holy symbols, gentle expression, ';
  } else if (name.includes('Barbarian')) {
    prompt += 'fierce warrior, furs and leather, battle scars, honorable, ';
  } else if (name.includes('Monk')) {
    prompt += 'peaceful monk, simple robes, shaved head, calm expression, ';
  } else if (name.includes('Warlock')) {
    prompt += 'pact-bound mage, dark robes with arcane symbols, mysterious, ';
  } else if (name.includes('Druid')) {
    prompt += 'nature druid, clothing made from living plants, wild appearance, ';
  } else if (name.includes('Sorcerer')) {
    prompt += 'wild magic user, hair with magical sparks, energetic expression, ';
  } else if (name.includes('Fighter')) {
    prompt += 'skilled champion, battle-worn armor, determined expression, ';
  } else if (name.includes('Artificer')) {
    prompt += 'creative inventor, goggles, tools, innovative, ';
  } else if (name.includes('Blood') || name.includes('Hunter')) {
    prompt += 'dark protector, ritual marks visible, determined expression, ';
  } else if (name.includes('Warlord') || name.includes('Commander')) {
    prompt += 'military leader, impressive armor, commanding presence, ';
  } else if (name.includes('Shaman')) {
    prompt += 'mystical shaman, clothing decorated with ancestor symbols, spiritual, ';
  } else if (name.includes('Necromancer')) {
    prompt += 'dark mage, pale skin, dark robes that absorb light, mysterious, ';
  } else if (name.includes('Gentle') && name.includes('Giant')) {
    prompt += 'kind giant, large frame, gentle expression, protective, ';
  } else if (name.includes('Mad') && name.includes('Scientist')) {
    prompt += 'eccentric scientist, wild hair, goggles pushed up, enthusiastic, ';
  } else if (name.includes('Time')) {
    prompt += 'temporal explorer, futuristic clothing, temporal device visible, ';
  } else if (name.includes('Villain')) {
    prompt += 'theatrical antagonist, dramatic clothing, confident expression, ';
  } else if (name.includes('Mysterious')) {
    prompt += 'enigmatic stranger, shadowy features, mysterious smile, ';
  } else if (name.includes('Tsundere')) {
    prompt += 'anime schoolgirl, twin-tails, school uniform, tsundere expression, ';
  } else if (name.includes('Yandere')) {
    prompt += 'anime schoolgirl, innocent appearance, sweet smile hiding darkness, ';
  } else if (name.includes('Kuudere')) {
    prompt += 'anime character, short neat hair, emotionless expression, ';
  } else if (name.includes('Dere Dere')) {
    prompt += 'anime character, big sparkling eyes, bright smile, adorable, ';
  } else if (name.includes('Grumpy Old Man')) {
    prompt += 'elderly man, weathered face, thinning gray hair, worn cardigan, scowl, ';
  } else if (name.includes('Surfer')) {
    prompt += 'young man, sun-kissed skin, bleached blonde hair, laid-back smile, beach clothing, ';
  } else if (name.includes('Chef')) {
    prompt += 'middle-aged man, salt-and-pepper hair, crisp white chef coat, intense eyes, ';
  } else if (name.includes('Sassy Best Friend')) {
    prompt += 'young woman, vibrant purple hair, expressive eyes, trendy clothing, energetic, ';
  } else if (name.includes('Romantic Partner')) {
    prompt += 'caring person, warm eyes, gentle smile, comfortable thoughtful clothing, ';
  } else if (name.includes('Shy Introvert')) {
    prompt += 'nervous person, downcast eyes, comfortable non-attention-grabbing clothes, ';
  } else if (name.includes('Confident Leader')) {
    prompt += 'natural leader, commanding presence, well-dressed, sharp eyes, ';
  } else if (name.includes('Comedic Relief')) {
    prompt += 'funny person, expressive features, wild colorful hair, energetic, ';
  } else if (name.includes('AI Tutor') || name.includes('Therapy Bot')) {
    prompt += 'professional, warm friendly expression, approachable clothing, ';
  }
  
  // Always end with safety tags
  prompt += 'safe, non-sexualized, appropriate clothing, professional, clean, wholesome, anime style, high quality';
  
  return prompt.trim().replace(/\s+/g, ' ');
}

/**
 * Generate improved prompts
 */
function generateImprovedPrompts() {
  console.log('Reading persona templates...');
  const personas = JSON.parse(fs.readFileSync(PERSONAS_FILE, 'utf8'));
  
  console.log(`Found ${personas.length} personas`);
  console.log('Generating improved Perchance prompts...\n');
  
  const prompts = personas.map((persona, index) => {
    const gender = determineGender(persona, index);
    const prompt = generateDetailedPrompt(persona, gender);
    
    console.log(`${index + 1}. ${persona.name} (${gender})`);
    console.log(`   ${prompt.substring(0, 120)}...\n`);
    
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
  
  console.log(`\n✅ Generated ${prompts.length} improved prompts`);
  console.log(`   Male: ${maleCount}, Female: ${femaleCount}`);
  console.log(`📁 Saved to: ${PROMPTS_FILE}`);
}

generateImprovedPrompts();




