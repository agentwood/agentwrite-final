/**
 * Script to update character names to be more realistic
 * - Simple names for real-world characters (e.g., "David Jones" for doctors)
 * - Fantasy names for fantasy characters (e.g., "Aeliana Shadowweaver" for mages)
 * - Update avatar URLs to match names
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Character {
  id: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  greeting?: string | null;
  category: string;
  avatarUrl: string;
  voice: {
    voiceName: string;
    styleHint?: string | null;
  };
  archetype?: string;
  tonePack?: string;
  scenarioSkin?: string;
  system: {
    persona: string;
    boundaries: string[];
    style: string[];
    examples?: Array<{ user: string; assistant: string }>;
  };
  voiceName?: string;
  creator?: string;
}

// Name mappings for realistic names based on category and profession
const realisticNames: Record<string, string[]> = {
  doctor: ['David Jones', 'Sarah Mitchell', 'Michael Chen', 'Emily Rodriguez', 'James Wilson'],
  lawyer: ['James Chen', 'Lisa Anderson', 'Robert Martinez', 'Jennifer Kim', 'Thomas Brown'],
  teacher: ['Elena Rodriguez', 'Robert Thompson', 'Maria Garcia', 'David Lee', 'Jennifer White'],
  chef: ['Marco Rossi', 'Julia Chen', 'Antonio Martinez', 'Sophie Laurent', 'Giuseppe Romano'],
  engineer: ['Priya Patel', 'Alex Kim', 'David Zhang', 'Sarah Johnson', 'Michael Park'],
  therapist: ['Michael Brooks', 'Sarah Williams', 'David Taylor', 'Emma Davis', 'James Anderson'],
  pilot: ['Rachel Thompson', 'Mark Johnson', 'Sarah Davis', 'David Miller', 'Jennifer Wilson'],
  journalist: ['Alex Kim', 'Sarah Martinez', 'David Chen', 'Emma Rodriguez', 'Michael Park'],
  architect: ['David Martinez', 'Sophie Chen', 'James Anderson', 'Maria Garcia', 'Thomas Brown'],
  financial: ['Lisa Wang', 'Robert Chen', 'Sarah Johnson', 'David Kim', 'Jennifer Martinez'],
  scientist: ['Kevin Nguyen', 'Sarah Chen', 'David Park', 'Emma Kim', 'Michael Zhang'],
  military: ['Wendy Hughes', 'James Anderson', 'Sarah Johnson', 'David Miller', 'Jennifer Wilson'],
};

// Fantasy name generators
const fantasyFirstNames = [
  'Aeliana', 'Thorin', 'Lyra', 'Kael', 'Seraphina', 'Zephyr', 'Aurora', 'Draven',
  'Elara', 'Riven', 'Luna', 'Orion', 'Celeste', 'Fenrir', 'Nyx', 'Aether',
  'Vex', 'Sylas', 'Iris', 'Kiran', 'Zara', 'Cyrus', 'Nova', 'Raven'
];

const fantasyLastNames = [
  'Shadowweaver', 'Stormcaller', 'Moonwhisper', 'Starfire', 'Darkbane', 'Lightbringer',
  'Frostwind', 'Emberheart', 'Thornwood', 'Silverblade', 'Nightshade', 'Dawnbreaker',
  'Ironforge', 'Skyward', 'Voidwalker', 'Sunstrider', 'Bloodmoon', 'Crystalheart'
];

function generateFantasyName(): string {
  const firstName = fantasyFirstNames[Math.floor(Math.random() * fantasyFirstNames.length)];
  const lastName = fantasyLastNames[Math.floor(Math.random() * fantasyLastNames.length)];
  return `${firstName} ${lastName}`;
}

function getRealisticName(category: string, profession?: string): string {
  // Check if it's a professional character
  if (profession && realisticNames[profession.toLowerCase()]) {
    const names = realisticNames[profession.toLowerCase()];
    return names[Math.floor(Math.random() * names.length)];
  }
  
  // Check category-based names
  if (category === 'support' || category === 'educational') {
    // Use simple professional names
    const allNames = Object.values(realisticNames).flat();
    return allNames[Math.floor(Math.random() * allNames.length)];
  }
  
  // Default to a simple name
  const simpleNames = ['David', 'Sarah', 'Michael', 'Emily', 'James', 'Jennifer', 'Robert', 'Maria'];
  const simpleLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  return `${simpleNames[Math.floor(Math.random() * simpleNames.length)]} ${simpleLastNames[Math.floor(Math.random() * simpleLastNames.length)]}`;
}

function updateCharacterName(char: Character): Character {
  const isFantasy = char.category === 'fantasy' || 
                    char.scenarioSkin === 'fantasy' || 
                    char.name.toLowerCase().includes('dragon') ||
                    char.name.toLowerCase().includes('mage') ||
                    char.name.toLowerCase().includes('knight') ||
                    char.name.toLowerCase().includes('elf') ||
                    char.name.toLowerCase().includes('demon') ||
                    char.name.toLowerCase().includes('ancient') ||
                    char.name.toLowerCase().includes('paladin') ||
                    char.name.toLowerCase().includes('forest') ||
                    char.name.toLowerCase().includes('shaman') ||
                    char.name.toLowerCase().includes('warrior') ||
                    char.name.toLowerCase().includes('swordsman') ||
                    char.name.toLowerCase().includes('archer');

  if (isFantasy) {
    // Generate fantasy name
    char.name = generateFantasyName();
  } else {
    // Extract profession from persona or use category
    const persona = char.system.persona.toLowerCase();
    let profession = '';
    
    if (persona.includes('doctor') || persona.includes('physician') || persona.includes('medical')) {
      profession = 'doctor';
    } else if (persona.includes('lawyer') || persona.includes('attorney') || persona.includes('legal')) {
      profession = 'lawyer';
    } else if (persona.includes('teacher') || persona.includes('professor') || persona.includes('educator')) {
      profession = 'teacher';
    } else if (persona.includes('chef') || persona.includes('cook') || persona.includes('culinary')) {
      profession = 'chef';
    } else if (persona.includes('engineer') || persona.includes('software') || persona.includes('developer')) {
      profession = 'engineer';
    } else if (persona.includes('therapist') || persona.includes('psychologist') || persona.includes('counselor')) {
      profession = 'therapist';
    } else if (persona.includes('pilot') || persona.includes('aviation')) {
      profession = 'pilot';
    } else if (persona.includes('journalist') || persona.includes('reporter')) {
      profession = 'journalist';
    } else if (persona.includes('architect')) {
      profession = 'architect';
    } else if (persona.includes('financial') || persona.includes('planner') || persona.includes('advisor')) {
      profession = 'financial';
    } else if (persona.includes('scientist') || persona.includes('researcher')) {
      profession = 'scientist';
    } else if (persona.includes('commander') || persona.includes('military')) {
      profession = 'military';
    }
    
    char.name = getRealisticName(char.category, profession);
  }

  // Update avatar URL to match name
  if (isFantasy) {
    // Use waifu.pics for fantasy characters
    char.avatarUrl = `https://i.waifu.pics/${char.id}.jpg`;
  } else {
    // Use dicebear for realistic characters with name-based seed
    const seed = char.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    char.avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
  }

  return char;
}

function enhanceBio(char: Character): Character {
  // Enhance description if it's too short or generic
  if (!char.description || char.description.length < 50) {
    const persona = char.system.persona;
    const category = char.category;
    
    // Create a more detailed description
    let enhancedDescription = persona.split('.')[0]; // First sentence of persona
    
    if (char.tagline) {
      enhancedDescription += ` // ${char.tagline}`;
    } else {
      // Generate a tagline from persona
      const keyWords = persona.match(/\b\w{4,}\b/g) || [];
      if (keyWords.length > 0) {
        const tagline = keyWords.slice(0, 3).join(' ').toLowerCase();
        enhancedDescription += ` // ${tagline}`;
      }
    }
    
    char.description = enhancedDescription;
  }

  // Enhance tagline if missing
  if (!char.tagline && char.description) {
    const parts = char.description.split('//');
    if (parts.length > 1) {
      char.tagline = parts[1].trim();
    } else {
      // Extract a tagline from persona
      const persona = char.system.persona;
      const sentences = persona.split('.');
      if (sentences.length > 1) {
        char.tagline = sentences[1].trim().substring(0, 100);
      }
    }
  }

  return char;
}

async function main() {
  // Resolve path relative to project root (character-chat directory)
  // When running from character-chat directory, process.cwd() will be correct
  const dataPath = join(process.cwd(), 'data', 'persona-templates.seed.json');
  
  console.log('📖 Reading character data...');
  const data = JSON.parse(readFileSync(dataPath, 'utf-8')) as Character[];
  
  console.log(`📝 Updating ${data.length} characters...`);
  
  const updated = data.map((char, index) => {
    if (index % 10 === 0) {
      console.log(`  Processing ${index + 1}/${data.length}...`);
    }
    
    // Update name and avatar
    let updatedChar = updateCharacterName(char);
    
    // Enhance bio
    updatedChar = enhanceBio(updatedChar);
    
    return updatedChar;
  });
  
  console.log('💾 Writing updated data...');
  writeFileSync(dataPath, JSON.stringify(updated, null, 2), 'utf-8');
  
  console.log('✅ Done! Updated all characters.');
  console.log(`   - Total characters: ${updated.length}`);
  console.log(`   - Fantasy characters: ${updated.filter(c => c.category === 'fantasy' || c.scenarioSkin === 'fantasy').length}`);
  console.log(`   - Realistic characters: ${updated.length - updated.filter(c => c.category === 'fantasy' || c.scenarioSkin === 'fantasy').length}`);
}

main().catch(console.error);

