/**
 * Improve character descriptions to match Character.ai style
 * Format: "Character Name // Short, punchy description matching persona/avatar"
 */

const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '../data/persona-templates.seed.json');

function generateCharacterAIStyleDescription(persona) {
  const name = persona.name;
  const systemPersona = (persona.system?.persona || '').toLowerCase();
  const tagline = persona.tagline || '';
  const category = persona.category?.toLowerCase() || '';
  const archetype = persona.archetype?.toLowerCase() || '';
  
  // Extract key traits
  const isGrumpy = systemPersona.includes('grumpy') || systemPersona.includes('curmudgeon');
  const isOld = systemPersona.includes('old') || systemPersona.includes('elder') || 
                systemPersona.includes('retired') || systemPersona.includes('veteran') ||
                systemPersona.includes('granny') || systemPersona.includes('grandfather');
  const isMilitary = systemPersona.includes('military') || systemPersona.includes('commander') ||
                     systemPersona.includes('soldier') || systemPersona.includes('veteran');
  const isSurfer = systemPersona.includes('surfer') || systemPersona.includes('beach');
  const isSassy = systemPersona.includes('sassy') || systemPersona.includes('brutal');
  const isDetective = systemPersona.includes('detective') || systemPersona.includes('noir');
  const isChef = systemPersona.includes('chef') || systemPersona.includes('cooking');
  const isWizard = systemPersona.includes('wizard') || systemPersona.includes('mage') || 
                  systemPersona.includes('sorcerer') || systemPersona.includes('sage');
  const isWarrior = systemPersona.includes('warrior') || systemPersona.includes('knight') ||
                   systemPersona.includes('paladin') || systemPersona.includes('samurai');
  const isVampire = systemPersona.includes('vampire');
  const isDragon = systemPersona.includes('dragon');
  const isElf = systemPersona.includes('elf') || systemPersona.includes('elven');
  const isSpace = systemPersona.includes('space') || systemPersona.includes('explorer');
  const isTsundere = systemPersona.includes('tsundere');
  const isYandere = systemPersona.includes('yandere');
  const isKuudere = systemPersona.includes('kuudere');
  const isDoctor = systemPersona.includes('doctor') || systemPersona.includes('physician') ||
                  systemPersona.includes('er physician');
  const isLawyer = systemPersona.includes('lawyer') || systemPersona.includes('attorney');
  const isProfessor = systemPersona.includes('professor') || systemPersona.includes('neuroscience');
  const isEngineer = systemPersona.includes('engineer') || systemPersona.includes('software');
  const isTherapist = systemPersona.includes('therapist') || systemPersona.includes('psychologist');
  const isPilot = systemPersona.includes('pilot');
  const isJournalist = systemPersona.includes('journalist');
  const isArchitect = systemPersona.includes('architect');
  const isFinancial = systemPersona.includes('financial') || systemPersona.includes('planner');
  const isClimate = systemPersona.includes('climate') || systemPersona.includes('scientist');
  const isKaren = systemPersona.includes('karen') || name.toLowerCase().includes('karen');
  const isTribal = systemPersona.includes('tribal') || systemPersona.includes('shaman');
  
  // Generate descriptions matching Character.ai style
  if (isGrumpy && isOld) {
    return `${name} // Grumpy old man who complains about everything.`;
  }
  
  if (isMilitary && name.includes('Wendy')) {
    return `${name} // Mandatory therapy department commander.`;
  }
  
  if (isDoctor) {
    return `${name} // ER physician with ${systemPersona.includes('15') ? '15' : 'years of'} experience.`;
  }
  
  if (isLawyer) {
    return `${name} // Criminal defense lawyer specializing in high-stakes cases.`;
  }
  
  if (isProfessor) {
    return `${name} // Neuroscience professor and researcher.`;
  }
  
  if (isChef) {
    return `${name} // Michelin-starred Italian chef.`;
  }
  
  if (isEngineer) {
    return `${name} // Senior software engineer specializing in AI and ML.`;
  }
  
  if (isTherapist) {
    return `${name} // Licensed clinical psychologist specializing in trauma.`;
  }
  
  if (isPilot) {
    return `${name} // Commercial airline pilot with 18 years of experience.`;
  }
  
  if (isJournalist) {
    return `${name} // Investigative journalist covering international affairs.`;
  }
  
  if (isArchitect) {
    return `${name} // Award-winning architect specializing in sustainable design.`;
  }
  
  if (isFinancial) {
    return `${name} // Certified financial planner helping achieve goals.`;
  }
  
  if (isClimate) {
    return `${name} // Climate scientist researching renewable energy solutions.`;
  }
  
  if (isSurfer) {
    return `${name} // Chill surfer with zero urgency.`;
  }
  
  if (isSassy) {
    return `${name} // Brutally honest, always supportive.`;
  }
  
  if (isDetective) {
    return `${name} // Hard-boiled detective solving mysteries.`;
  }
  
  if (isWizard) {
    return `${name} // Powerful wizard with ancient magic.`;
  }
  
  if (isWarrior) {
    if (systemPersona.includes('samurai')) {
      return `${name} // Samurai warrior with honor and precision.`;
    }
    if (systemPersona.includes('paladin')) {
      return `${name} // Holy paladin fighting for justice.`;
    }
    return `${name} // Brave warrior fighting for justice.`;
  }
  
  if (isVampire) {
    return `${name} // Noble vampire with centuries of experience.`;
  }
  
  if (isDragon) {
    return `${name} // Ancient dragon sage with wisdom.`;
  }
  
  if (isElf) {
    return `${name} // Elven archer with precision and grace.`;
  }
  
  if (isSpace) {
    return `${name} // Space explorer discovering new worlds.`;
  }
  
  if (isTsundere) {
    return `${name} // Tsundere anime girl who acts tough but cares.`;
  }
  
  if (isYandere) {
    return `${name} // Yandere obsessive character with intense emotions.`;
  }
  
  if (isKuudere) {
    return `${name} // Kuudere cold character with hidden warmth.`;
  }
  
  if (isKaren) {
    return `${name} // Angry Karen with strong opinions.`;
  }
  
  if (isTribal) {
    if (systemPersona.includes('shaman')) {
      return `${name} // Indigenous shaman with ancient wisdom.`;
    }
    return `${name} // African tribal warrior with honor.`;
  }
  
  if (isOld && systemPersona.includes('granny')) {
    return `${name} // Sweet old granny with decades of wisdom.`;
  }
  
  // Use tagline if it's good and short
  if (tagline && tagline.length < 50 && !tagline.includes('//')) {
    return `${name} // ${tagline}`;
  }
  
  // Fallback: generate from archetype/category
  if (archetype && category) {
    return `${name} // ${archetype} ${category} character.`;
  }
  
  return `${name} // ${category || 'character'} ready to chat.`;
}

function improveDescriptions() {
  const personas = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  
  let updated = 0;
  const samples = [];
  
  personas.forEach((persona) => {
    const newDescription = generateCharacterAIStyleDescription(persona);
    
    if (newDescription && newDescription !== persona.description) {
      persona.description = newDescription;
      updated++;
      if (samples.length < 15) {
        samples.push({ name: persona.name, desc: newDescription });
      }
    }
  });
  
  // Save updated file
  fs.writeFileSync(SEED_FILE, JSON.stringify(personas, null, 2));
  
  console.log(`✅ Updated ${updated} character descriptions`);
  console.log(`\n📋 Sample descriptions (Character.ai style):`);
  samples.forEach(({ name, desc }) => {
    console.log(`  ${desc}`);
  });
  
  console.log(`\n💡 Next: Run 'npm run db:seed' to update database`);
}

improveDescriptions();



