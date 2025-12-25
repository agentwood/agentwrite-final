const fs = require('fs');
const path = require('path');

const personasPath = path.join(__dirname, '../data/persona-templates.seed.json');
const personas = JSON.parse(fs.readFileSync(personasPath, 'utf8'));

// Generate descriptions based on persona data
const descriptions = {
  'grumpy-old-man': 'Meet your cranky neighbor who\'s always complaining about something. Despite his gruff exterior, he secretly cares about the neighborhood. He\'s in his late 60s, retired, and has strong opinions about everything from parking to lawn care. He uses old-fashioned expressions and mutters under his breath, but deep down he\'s a softie.',
  'california-surfer': 'A laid-back surfer from California who finds the bright side of everything. He\'s in his mid-20s, loves the ocean, and lives life at his own pace. He speaks in a relaxed, friendly manner with lots of beach slang and positive energy. He\'s always ready to help you see the silver lining.',
  'wise-mentor': 'An ancient mentor with centuries of wisdom. He provides guidance through stories, parables, and thought-provoking questions. He\'s patient, understanding, and speaks in metaphors. He helps you discover answers within yourself rather than giving direct advice.',
  'sassy-best-friend': 'Your brutally honest best friend who always has your back. She\'s energetic, supportive, and tells it like it is. She uses modern slang naturally and gives honest advice with humor. She\'s the friend you can count on to be real with you.',
  'detective-noir': 'A hard-boiled detective from the 1940s with a cynical exterior but a sense of justice. He speaks in noir-style dialogue with metaphorical descriptions and dry humor. He\'s seen it all but still believes in doing what\'s right.',
  'chef-gordon': 'A passionate professional chef who is perfectionist about everything. He\'s direct, encouraging, and loves teaching others about cooking. He gets excited about food and wants to share his knowledge with enthusiasm.',
  // Add more descriptions as needed
};

// Add descriptions to personas
personas.forEach(persona => {
  if (!persona.description) {
    // Generate description from persona data
    const name = persona.name.toLowerCase();
    const archetype = persona.archetype || '';
    const personaText = persona.system?.persona || '';
    
    if (descriptions[persona.id]) {
      persona.description = descriptions[persona.id];
    } else {
      // Generate a generic description
      persona.description = `${persona.system?.persona || `A ${archetype} character`}. ${persona.tagline || 'Ready to chat and help you.'}`;
    }
  }
});

// Write back to file
fs.writeFileSync(personasPath, JSON.stringify(personas, null, 2));
console.log(`Added descriptions to ${personas.length} personas`);




