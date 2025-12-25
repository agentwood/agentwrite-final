/**
 * Script to generate safe, upper-body (belly-upward) character avatars
 * Uses Perchance.org AI Anime Generator style prompts
 * Focuses on portrait/bust shots, non-sexualized
 */

const fs = require('fs');
const path = require('path');

const PERSONAS_FILE = path.join(__dirname, '../data/persona-templates.seed.json');
const OUTPUT_FILE = path.join(__dirname, '../data/persona-templates.seed.json');
const PROMPTS_FILE = path.join(__dirname, '../data/perchance-prompts.json');

/**
 * Generate safe, upper-body focused prompt for Perchance
 */
function generatePerchancePrompt(persona) {
  const desc = persona.description || '';
  const name = persona.name;
  const category = persona.category || 'fiction';
  
  // Extract key physical details from description
  let prompt = '';
  
  // Determine if human or fantasy character
  const isHuman = category === 'realistic' || 
                  name.toLowerCase().includes('old man') ||
                  name.toLowerCase().includes('surfer') ||
                  name.toLowerCase().includes('chef') ||
                  name.toLowerCase().includes('tutor') ||
                  name.toLowerCase().includes('therapy') ||
                  name.toLowerCase().includes('comedic') ||
                  name.toLowerCase().includes('leader') ||
                  name.toLowerCase().includes('introvert') ||
                  name.toLowerCase().includes('romantic') ||
                  name.toLowerCase().includes('sassy') ||
                  name.toLowerCase().includes('best friend');
  
  if (isHuman) {
    // For human characters, use a more realistic style
    // Extract age, appearance from description
    let ageDesc = '';
    let appearanceDesc = '';
    
    if (desc.includes("late 60s") || desc.includes("60s")) {
      ageDesc = "elderly man";
    } else if (desc.includes("mid-20s") || desc.includes("20s")) {
      ageDesc = "young adult";
    } else if (desc.includes("50s")) {
      ageDesc = "middle-aged";
    } else {
      ageDesc = "adult";
    }
    
    // Extract key features
    if (desc.includes("gray hair") || desc.includes("thinning")) {
      appearanceDesc = "gray hair";
    } else if (desc.includes("blonde")) {
      appearanceDesc = "blonde hair";
    } else {
      appearanceDesc = "natural hair";
    }
    
    // Create safe portrait prompt
    prompt = `portrait of ${ageDesc}, ${appearanceDesc}, friendly expression, casual clothing, upper body shot, professional, safe, non-sexualized, anime style`;
  } else {
    // For fantasy characters, use anime style
    // Extract character type and appearance
    let characterType = '';
    let styleDesc = '';
    
    if (name.includes("Wizard") || name.includes("Sage") || name.includes("Mentor")) {
      characterType = "wise mage";
      styleDesc = "long robes, mystical, ancient";
    } else if (name.includes("Knight") || name.includes("Paladin") || name.includes("Warrior")) {
      characterType = "noble warrior";
      styleDesc = "armor, honorable, strong";
    } else if (name.includes("Elf")) {
      characterType = "graceful elf";
      styleDesc = "pointed ears, ethereal, nature-connected";
    } else if (name.includes("Vampire")) {
      characterType = "elegant vampire";
      styleDesc = "pale skin, aristocratic, refined";
    } else if (name.includes("Ninja") || name.includes("Rogue")) {
      characterType = "stealthy warrior";
      styleDesc = "masked, mysterious, skilled";
    } else if (name.includes("Samurai")) {
      characterType = "honorable samurai";
      styleDesc = "traditional, disciplined, respectful";
    } else if (name.includes("Pirate")) {
      characterType = "adventurous pirate";
      styleDesc = "tricorn hat, weathered, charismatic";
    } else if (name.includes("Dragon")) {
      characterType = "brave dragon rider";
      styleDesc = "wind-swept, adventurous, bonded";
    } else if (name.includes("Robot") || name.includes("Android")) {
      characterType = "friendly android";
      styleDesc = "metallic, futuristic, approachable";
    } else if (name.includes("Cyberpunk") || name.includes("Hacker")) {
      characterType = "tech-savvy rebel";
      styleDesc = "neon, futuristic, cyberpunk";
    } else if (name.includes("Space")) {
      characterType = "interstellar explorer";
      styleDesc = "spacesuit, curious, optimistic";
    } else if (name.includes("Tsundere") || name.includes("Yandere") || name.includes("Kuudere") || name.includes("Dere")) {
      characterType = "anime character";
      styleDesc = "school uniform, expressive, cute";
    } else if (name.includes("Detective")) {
      characterType = "noir detective";
      styleDesc = "fedora, trench coat, mysterious";
    } else if (name.includes("Bard")) {
      characterType = "charismatic bard";
      styleDesc = "musical, colorful, travel-worn";
    } else if (name.includes("Alchemist")) {
      characterType = "curious alchemist";
      styleDesc = "goggles, potions, experimental";
    } else if (name.includes("Ranger")) {
      characterType = "nature guardian";
      styleDesc = "forest, practical, wild";
    } else if (name.includes("Cleric") || name.includes("Healer")) {
      characterType = "compassionate healer";
      styleDesc = "holy symbols, gentle, caring";
    } else if (name.includes("Barbarian")) {
      characterType = "fierce warrior";
      styleDesc = "furs, strong, honorable";
    } else if (name.includes("Monk")) {
      characterType = "peaceful monk";
      styleDesc = "simple robes, calm, disciplined";
    } else if (name.includes("Warlock")) {
      characterType = "pact-bound mage";
      styleDesc = "dark robes, mysterious, powerful";
    } else if (name.includes("Druid")) {
      characterType = "nature druid";
      styleDesc = "living plants, wild, connected";
    } else if (name.includes("Sorcerer")) {
      characterType = "wild magic user";
      styleDesc = "sparks, unpredictable, energetic";
    } else if (name.includes("Fighter")) {
      characterType = "skilled champion";
      styleDesc = "armor, determined, master";
    } else if (name.includes("Artificer")) {
      characterType = "creative inventor";
      styleDesc = "goggles, tools, innovative";
    } else if (name.includes("Blood") || name.includes("Hunter")) {
      characterType = "dark protector";
      styleDesc = "ritual marks, determined, protective";
    } else if (name.includes("Warlord") || name.includes("Commander")) {
      characterType = "military leader";
      styleDesc = "armor, commanding, strategic";
    } else if (name.includes("Shaman")) {
      characterType = "mystical shaman";
      styleDesc = "spiritual, connected, wise";
    } else if (name.includes("Necromancer")) {
      characterType = "dark mage";
      styleDesc = "dark robes, pale, mysterious";
    } else if (name.includes("Gentle") && name.includes("Giant")) {
      characterType = "kind giant";
      styleDesc = "large, gentle, protective";
    } else if (name.includes("Mad") && name.includes("Scientist")) {
      characterType = "eccentric scientist";
      styleDesc = "wild hair, goggles, enthusiastic";
    } else if (name.includes("Time")) {
      characterType = "temporal explorer";
      styleDesc = "futuristic, curious, knowledgeable";
    } else if (name.includes("Villain")) {
      characterType = "theatrical antagonist";
      styleDesc = "dramatic, confident, charismatic";
    } else if (name.includes("Mysterious")) {
      characterType = "enigmatic stranger";
      styleDesc = "shadowy, mysterious, intriguing";
    } else {
      characterType = "fantasy character";
      styleDesc = "mystical, unique, interesting";
    }
    
    // Create safe anime portrait prompt
    prompt = `anime portrait, ${characterType}, ${styleDesc}, upper body shot, bust, from waist up, safe, non-sexualized, appropriate clothing, professional, clean, wholesome`;
  }
  
  // Ensure prompt emphasizes safety and upper body
  if (!prompt.includes("upper body") && !prompt.includes("bust") && !prompt.includes("portrait")) {
    prompt += ", portrait, upper body shot, from waist up";
  }
  
  // Always add safety tags
  if (!prompt.includes("safe") && !prompt.includes("non-sexualized")) {
    prompt += ", safe, non-sexualized, appropriate";
  }
  
  return prompt.trim();
}

/**
 * Generate image URLs using a placeholder approach
 * Since Perchance doesn't have an API, we'll create prompts
 * and use a proxy/CDN approach or manual generation
 */
function generateImageUrl(persona, prompt) {
  // For now, we'll use a seed-based approach that can be replaced
  // with actual Perchance-generated images later
  // The user can generate images using these prompts and upload them
  
  // Use a placeholder that indicates it needs to be generated
  // In production, these would be actual image URLs from Perchance
  const seed = persona.id.replace(/-/g, '');
  
  // For human characters, keep Dicebear (it's already safe)
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
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
  }
  
  // For fantasy characters, we'll use a placeholder URL structure
  // that can be replaced with actual Perchance-generated images
  // Format: /avatars/[character-id].jpg
  // These will need to be generated manually using the prompts
  return `/avatars/${persona.id}.jpg`;
}

/**
 * Update persona templates with Perchance-style prompts and URLs
 */
function updatePersonasWithPerchance() {
  console.log('Reading persona templates...');
  const personas = JSON.parse(fs.readFileSync(PERSONAS_FILE, 'utf8'));
  
  console.log(`Found ${personas.length} personas`);
  console.log('Generating Perchance prompts and updating avatars...\n');
  
  const prompts = [];
  const updated = personas.map((persona, index) => {
    const prompt = generatePerchancePrompt(persona);
    const newUrl = generateImageUrl(persona, prompt);
    
    prompts.push({
      id: persona.id,
      name: persona.name,
      prompt: prompt,
      url: newUrl
    });
    
    console.log(`${index + 1}. ${persona.name}`);
    console.log(`   Prompt: ${prompt}`);
    console.log(`   URL: ${newUrl}\n`);
    
    return {
      ...persona,
      avatarUrl: newUrl,
    };
  });
  
  // Save prompts to file for manual generation
  fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2));
  console.log(`\n📝 Saved ${prompts.length} prompts to: ${PROMPTS_FILE}`);
  console.log('   Use these prompts in Perchance.org AI Anime Generator');
  console.log('   Then update the avatarUrl fields with the generated image URLs\n');
  
  // Write updated personas
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updated, null, 2));
  console.log(`✅ Updated ${updated.length} personas`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log('\n⚠️  Note: Fantasy character URLs are placeholders.');
  console.log('   Generate images using the prompts in perchance-prompts.json');
  console.log('   Then update avatarUrl fields with actual image URLs.');
}

// Run the script
updatePersonasWithPerchance();



