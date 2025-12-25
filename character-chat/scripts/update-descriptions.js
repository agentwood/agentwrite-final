/**
 * Update character descriptions to match their personas and avatars
 * Make them concise, punchy, and aligned with Character.ai style
 */

const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '../data/persona-templates.seed.json');

// Description templates based on character type and persona
function generateDescription(persona) {
  const name = persona.name;
  const category = persona.category?.toLowerCase() || '';
  const archetype = persona.archetype?.toLowerCase() || '';
  const tagline = persona.tagline || '';
  const systemPersona = persona.system?.persona || '';
  
  // Extract key traits from persona
  const isOld = systemPersona.toLowerCase().includes('old') || 
                systemPersona.toLowerCase().includes('elder') ||
                systemPersona.toLowerCase().includes('retired') ||
                systemPersona.toLowerCase().includes('veteran') ||
                systemPersona.toLowerCase().includes('granny');
  
  const isMilitary = systemPersona.toLowerCase().includes('military') ||
                    systemPersona.toLowerCase().includes('commander') ||
                    systemPersona.toLowerCase().includes('soldier');
  
  const isProfessional = systemPersona.toLowerCase().includes('doctor') ||
                         systemPersona.toLowerCase().includes('lawyer') ||
                         systemPersona.toLowerCase().includes('professor') ||
                         systemPersona.toLowerCase().includes('engineer') ||
                         systemPersona.toLowerCase().includes('chef') ||
                         systemPersona.toLowerCase().includes('therapist');
  
  const isFantasy = category === 'fantasy' || category === 'fiction' || 
                    category === 'adventure' || category === 'horror';
  
  const isAnime = isFantasy && (systemPersona.toLowerCase().includes('anime') ||
                                systemPersona.toLowerCase().includes('waifu') ||
                                systemPersona.toLowerCase().includes('tsundere') ||
                                systemPersona.toLowerCase().includes('yandere'));
  
  // Generate description based on character type
  if (isMilitary) {
    return `${name} // Military commander leading a team of specialists.`;
  }
  
  if (isProfessional) {
    if (systemPersona.toLowerCase().includes('doctor') || systemPersona.toLowerCase().includes('physician')) {
      return `${name} // ER physician with years of experience.`;
    }
    if (systemPersona.toLowerCase().includes('lawyer') || systemPersona.toLowerCase().includes('attorney')) {
      return `${name} // Criminal defense lawyer specializing in high-stakes cases.`;
    }
    if (systemPersona.toLowerCase().includes('professor') || systemPersona.toLowerCase().includes('neuroscience')) {
      return `${name} // Neuroscience professor and researcher.`;
    }
    if (systemPersona.toLowerCase().includes('chef')) {
      return `${name} // Michelin-starred Italian chef.`;
    }
    if (systemPersona.toLowerCase().includes('engineer')) {
      return `${name} // Senior software engineer specializing in AI and ML.`;
    }
    if (systemPersona.toLowerCase().includes('therapist') || systemPersona.toLowerCase().includes('psychologist')) {
      return `${name} // Licensed clinical psychologist specializing in trauma.`;
    }
    if (systemPersona.toLowerCase().includes('pilot')) {
      return `${name} // Commercial airline pilot with 18 years of experience.`;
    }
    if (systemPersona.toLowerCase().includes('journalist')) {
      return `${name} // Investigative journalist covering international affairs.`;
    }
    if (systemPersona.toLowerCase().includes('architect')) {
      return `${name} // Award-winning architect specializing in sustainable design.`;
    }
    if (systemPersona.toLowerCase().includes('financial') || systemPersona.toLowerCase().includes('planner')) {
      return `${name} // Certified financial planner helping achieve goals.`;
    }
    if (systemPersona.toLowerCase().includes('climate') || systemPersona.toLowerCase().includes('scientist')) {
      return `${name} // Climate scientist researching renewable energy solutions.`;
    }
  }
  
  if (isOld) {
    if (systemPersona.toLowerCase().includes('granny') || systemPersona.toLowerCase().includes('grandmother')) {
      return `${name} // Sweet old granny with decades of wisdom.`;
    }
    if (systemPersona.toLowerCase().includes('grumpy') || systemPersona.toLowerCase().includes('curmudgeon')) {
      return `${name} // Grumpy old man who complains about everything.`;
    }
    if (systemPersona.toLowerCase().includes('veteran')) {
      return `${name} // Grumpy retired veteran with stories to tell.`;
    }
    return `${name} // Elder with wisdom and experience.`;
  }
  
  if (isAnime) {
    if (systemPersona.toLowerCase().includes('tsundere')) {
      return `${name} // Tsundere anime girl who acts tough but cares deeply.`;
    }
    if (systemPersona.toLowerCase().includes('yandere')) {
      return `${name} // Yandere obsessive character with intense emotions.`;
    }
    if (systemPersona.toLowerCase().includes('kuudere')) {
      return `${name} // Kuudere cold character with hidden warmth.`;
    }
    return `${name} // Anime character ready for adventure.`;
  }
  
  if (isFantasy) {
    if (systemPersona.toLowerCase().includes('wizard') || systemPersona.toLowerCase().includes('mage') || systemPersona.toLowerCase().includes('sorcerer')) {
      return `${name} // Powerful wizard with ancient magic.`;
    }
    if (systemPersona.toLowerCase().includes('warrior') || systemPersona.toLowerCase().includes('knight') || systemPersona.toLowerCase().includes('paladin')) {
      return `${name} // Brave warrior fighting for justice.`;
    }
    if (systemPersona.toLowerCase().includes('vampire')) {
      return `${name} // Noble vampire with centuries of experience.`;
    }
    if (systemPersona.toLowerCase().includes('dragon')) {
      return `${name} // Ancient dragon sage with wisdom.`;
    }
    if (systemPersona.toLowerCase().includes('elf')) {
      return `${name} // Elven archer with precision and grace.`;
    }
    if (systemPersona.toLowerCase().includes('detective') || systemPersona.toLowerCase().includes('noir')) {
      return `${name} // Detective solving mysteries in the shadows.`;
    }
    return `${name} // Fantasy character ready for adventure.`;
  }
  
  // Use tagline if it's good, otherwise generate from persona
  if (tagline && tagline.length < 60) {
    return `${name} // ${tagline}`;
  }
  
  // Fallback: use archetype and category
  const archetypeDesc = archetype ? `${archetype} ` : '';
  const categoryDesc = category ? `from ${category}` : '';
  return `${name} // ${archetypeDesc}${categoryDesc} character.`;
}

function updateDescriptions() {
  const personas = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  
  let updated = 0;
  
  personas.forEach((persona) => {
    const newDescription = generateDescription(persona);
    
    // Only update if different and meaningful
    if (newDescription && newDescription !== persona.description) {
      persona.description = newDescription;
      updated++;
    }
  });
  
  // Save updated file
  fs.writeFileSync(SEED_FILE, JSON.stringify(personas, null, 2));
  
  console.log(`✅ Updated ${updated} character descriptions`);
  console.log(`\n📋 Sample descriptions:`);
  personas.slice(0, 10).forEach(p => {
    console.log(`  ${p.name}: ${p.description}`);
  });
  
  console.log(`\n💡 Next: Run 'npm run db:seed' to update database`);
}

updateDescriptions();




