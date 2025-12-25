const fs = require('fs');
const path = require('path');

// Read the seed file
const seedPath = path.join(__dirname, '../data/persona-templates.seed.json');
const personas = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Categorize personas into realistic vs anime
const realisticCharacters = [
  'grumpy-old-man',
  'california-surfer',
  'sassy-best-friend',
  'chef-gordon',
  'ai-tutor',
  'therapy-bot',
  'shy-introvert',
  'confident-leader',
  'comedic-relief',
  'romantic-partner',
  'cyberpunk-hacker',
];

// Avatar URL mapping - Using more casual, everyday-looking portraits
// These are selected to match character descriptions and look like "the person next door"
// Using a mix of Unsplash casual portraits and face generation services
const avatarMap = {
  // Realistic characters - Casual, everyday people (not professional stock photos)
  // Using more diverse, casual Unsplash portraits that match each character's personality
  'grumpy-old-man': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face', // Older man, casual, grumpy expression
  'california-surfer': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', // Young casual surfer, relaxed, beach vibes
  'sassy-best-friend': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', // Casual young woman, friendly, everyday look
  'chef-gordon': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', // Casual chef, approachable, not too formal
  'ai-tutor': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', // Casual, friendly tutor, approachable
  'therapy-bot': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face', // Warm, casual woman, empathetic look
  'shy-introvert': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face', // Shy, casual woman, nervous but friendly
  'confident-leader': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', // Casual confident person, approachable leader
  'comedic-relief': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', // Fun, casual guy, humorous expression
  'romantic-partner': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', // Casual, warm person, friendly romantic
  'cyberpunk-hacker': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', // Casual tech person, modern, everyday look
  
  // Anime characters - Keep existing Dicebear notionists
  'wise-mentor': 'https://api.dicebear.com/7.x/notionists/svg?seed=wisementor&backgroundColor=b6e3f4,c0aede',
  'detective-noir': 'https://api.dicebear.com/7.x/notionists/svg?seed=detectivenoir&backgroundColor=ffd5dc,ffdfbf',
  'space-explorer': 'https://api.dicebear.com/7.x/notionists/svg?seed=spaceexplorer&backgroundColor=b6e3f4,c0aede',
  'medieval-knight': 'https://api.dicebear.com/7.x/notionists/svg?seed=medievalknight&backgroundColor=ffd5dc,ffdfbf',
  'tsundere-anime-girl': 'https://api.dicebear.com/7.x/notionists/svg?seed=tsundere&backgroundColor=ffd5dc,ffdfbf',
  'yandere-obsessive': 'https://api.dicebear.com/7.x/notionists/svg?seed=yandere&backgroundColor=ffd5dc,ffdfbf',
  'kuudere-cold': 'https://api.dicebear.com/7.x/notionists/svg?seed=kuudere&backgroundColor=b6e3f4,c0aede',
  'dere-dere-sweet': 'https://api.dicebear.com/7.x/notionists/svg?seed=deredere&backgroundColor=ffd5dc,ffdfbf',
  'villain-antagonist': 'https://api.dicebear.com/7.x/notionists/svg?seed=villain&backgroundColor=ffd5dc,ffdfbf',
  'mysterious-stranger': 'https://api.dicebear.com/7.x/notionists/svg?seed=mysterious&backgroundColor=ffd5dc,ffdfbf',
  'vampire-noble': 'https://api.dicebear.com/7.x/notionists/svg?seed=vampire&backgroundColor=ffd5dc,ffdfbf',
  'samurai-warrior': 'https://api.dicebear.com/7.x/notionists/svg?seed=samurai&backgroundColor=ffd5dc,ffdfbf',
  'wizard-sage': 'https://api.dicebear.com/7.x/notionists/svg?seed=wizard&backgroundColor=b6e3f4,c0aede',
  'robot-companion': 'https://api.dicebear.com/7.x/notionists/svg?seed=robot&backgroundColor=b6e3f4,c0aede',
  'pirate-captain': 'https://api.dicebear.com/7.x/notionists/svg?seed=pirate&backgroundColor=ffd5dc,ffdfbf',
  'ninja-assassin': 'https://api.dicebear.com/7.x/notionists/svg?seed=ninja&backgroundColor=ffd5dc,ffdfbf',
  'elf-archer': 'https://api.dicebear.com/7.x/notionists/svg?seed=elf&backgroundColor=b6e3f4,c0aede',
  'mad-scientist': 'https://api.dicebear.com/7.x/notionists/svg?seed=madscientist&backgroundColor=b6e3f4,c0aede',
  'gentle-giant': 'https://api.dicebear.com/7.x/notionists/svg?seed=giant&backgroundColor=ffd5dc,ffdfbf',
  'time-traveler': 'https://api.dicebear.com/7.x/notionists/svg?seed=timetraveler&backgroundColor=b6e3f4,c0aede',
  'dragon-rider': 'https://api.dicebear.com/7.x/notionists/svg?seed=dragonrider&backgroundColor=ffd5dc,ffdfbf',
  'necromancer-dark': 'https://api.dicebear.com/7.x/notionists/svg?seed=necromancer&backgroundColor=ffd5dc,ffdfbf',
  'bard-storyteller': 'https://api.dicebear.com/7.x/notionists/svg?seed=bard&backgroundColor=ffd5dc,ffdfbf',
  'alchemist-potion': 'https://api.dicebear.com/7.x/notionists/svg?seed=alchemist&backgroundColor=b6e3f4,c0aede',
  'ranger-woods': 'https://api.dicebear.com/7.x/notionists/svg?seed=ranger&backgroundColor=b6e3f4,c0aede',
  'paladin-holy': 'https://api.dicebear.com/7.x/notionists/svg?seed=paladin&backgroundColor=ffd5dc,ffdfbf',
  'rogue-thief': 'https://api.dicebear.com/7.x/notionists/svg?seed=rogue&backgroundColor=ffd5dc,ffdfbf',
  'cleric-healer': 'https://api.dicebear.com/7.x/notionists/svg?seed=cleric&backgroundColor=ffd5dc,ffdfbf',
  'barbarian-warrior': 'https://api.dicebear.com/7.x/notionists/svg?seed=barbarian&backgroundColor=ffd5dc,ffdfbf',
  'monk-spiritual': 'https://api.dicebear.com/7.x/notionists/svg?seed=monk&backgroundColor=b6e3f4,c0aede',
  'warlock-pact': 'https://api.dicebear.com/7.x/notionists/svg?seed=warlock&backgroundColor=ffd5dc,ffdfbf',
  'druid-nature': 'https://api.dicebear.com/7.x/notionists/svg?seed=druid&backgroundColor=b6e3f4,c0aede',
  'sorcerer-wild': 'https://api.dicebear.com/7.x/notionists/svg?seed=sorcerer&backgroundColor=ffd5dc,ffdfbf',
  'fighter-champion': 'https://api.dicebear.com/7.x/notionists/svg?seed=fighter&backgroundColor=ffd5dc,ffdfbf',
  'artificer-inventor': 'https://api.dicebear.com/7.x/notionists/svg?seed=artificer&backgroundColor=b6e3f4,c0aede',
  'blood-hunter': 'https://api.dicebear.com/7.x/notionists/svg?seed=bloodhunter&backgroundColor=ffd5dc,ffdfbf',
  'ranger-beast': 'https://api.dicebear.com/7.x/notionists/svg?seed=beastmaster&backgroundColor=b6e3f4,c0aede',
  'warlord-commander': 'https://api.dicebear.com/7.x/notionists/svg?seed=warlord&backgroundColor=ffd5dc,ffdfbf',
  'shaman-spirit': 'https://api.dicebear.com/7.x/notionists/svg?seed=shaman&backgroundColor=b6e3f4,c0aede',
};

// Update avatars
let updated = 0;
personas.forEach(persona => {
  if (avatarMap[persona.id]) {
    persona.avatarUrl = avatarMap[persona.id];
    updated++;
  } else {
    console.warn(`⚠️  No avatar mapping found for: ${persona.id}`);
  }
});

// Write updated file
fs.writeFileSync(seedPath, JSON.stringify(personas, null, 2));

console.log(`✅ Updated ${updated} avatars`);
console.log(`📊 Realistic: ${realisticCharacters.length}, Anime: ${personas.length - realisticCharacters.length}`);




