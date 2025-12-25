const fs = require('fs');
const path = require('path');

// Read the seed file
const seedPath = path.join(__dirname, '../data/persona-templates.seed.json');
const personas = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Avatar URL mapping - Using specific images that match character descriptions
// Realistic characters: Using Unsplash photos that match the character type
// Anime characters: Using anime-style image services or curated anime images
const avatarMap = {
  // REALISTIC CHARACTERS - Using Unsplash photos that match descriptions
  'grumpy-old-man': 'https://images.unsplash.com/photo-1582750433449-5ed4e5c8c0b7?w=400&h=400&fit=crop&crop=face', // Older man, grumpy expression
  'california-surfer': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', // Young, relaxed surfer
  'sassy-best-friend': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', // Confident, sassy woman
  'chef-gordon': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', // Chef, professional but approachable
  'ai-tutor': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', // Friendly, approachable tutor
  'therapy-bot': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', // Warm, empathetic woman
  'shy-introvert': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face', // Shy, nervous person
  'confident-leader': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', // Confident, professional leader
  'comedic-relief': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', // Fun, humorous person
  'romantic-partner': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face', // Warm, romantic person
  'cyberpunk-hacker': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', // Tech person, modern look
  
  // ANIME/FANTASY CHARACTERS - Using anime-style images
  // Using thispersondoesnotexist-style for anime, or curated anime images
  'wise-mentor': 'https://thiswaifudoesnotexist.net/v2/seed/12345', // Wise, mystical mentor
  'detective-noir': 'https://thiswaifudoesnotexist.net/v2/seed/12346', // Dark, mysterious detective
  'space-explorer': 'https://thiswaifudoesnotexist.net/v2/seed/12347', // Futuristic space explorer
  'medieval-knight': 'https://thiswaifudoesnotexist.net/v2/seed/12348', // Noble knight
  'tsundere-anime-girl': 'https://thiswaifudoesnotexist.net/v2/seed/12349', // Tsundere anime girl
  'yandere-obsessive': 'https://thiswaifudoesnotexist.net/v2/seed/12350', // Yandere character
  'kuudere-cold': 'https://thiswaifudoesnotexist.net/v2/seed/12351', // Cold, emotionless
  'dere-dere-sweet': 'https://thiswaifudoesnotexist.net/v2/seed/12352', // Sweet, loving
  'villain-antagonist': 'https://thiswaifudoesnotexist.net/v2/seed/12353', // Dark villain
  'vampire-noble': 'https://thiswaifudoesnotexist.net/v2/seed/12354', // Elegant vampire
  'samurai-warrior': 'https://thiswaifudoesnotexist.net/v2/seed/12355', // Samurai warrior
  'wizard-sage': 'https://thiswaifudoesnotexist.net/v2/seed/12356', // Wise wizard
  'robot-companion': 'https://thiswaifudoesnotexist.net/v2/seed/12357', // Robot/android
  'pirate-captain': 'https://thiswaifudoesnotexist.net/v2/seed/12358', // Pirate captain
  'ninja-assassin': 'https://thiswaifudoesnotexist.net/v2/seed/12359', // Ninja assassin
  'elf-archer': 'https://thiswaifudoesnotexist.net/v2/seed/12360', // Elf archer
  'mad-scientist': 'https://thiswaifudoesnotexist.net/v2/seed/12361', // Mad scientist
  'gentle-giant': 'https://thiswaifudoesnotexist.net/v2/seed/12362', // Gentle giant
  'time-traveler': 'https://thiswaifudoesnotexist.net/v2/seed/12363', // Time traveler
  'dragon-rider': 'https://thiswaifudoesnotexist.net/v2/seed/12364', // Dragon rider
  'necromancer-dark': 'https://thiswaifudoesnotexist.net/v2/seed/12365', // Dark necromancer
  'bard-storyteller': 'https://thiswaifudoesnotexist.net/v2/seed/12366', // Bard storyteller
  'alchemist-potion': 'https://thiswaifudoesnotexist.net/v2/seed/12367', // Alchemist
  'ranger-woods': 'https://thiswaifudoesnotexist.net/v2/seed/12368', // Ranger
  'paladin-holy': 'https://thiswaifudoesnotexist.net/v2/seed/12369', // Holy paladin
  'rogue-thief': 'https://thiswaifudoesnotexist.net/v2/seed/12370', // Rogue thief
  'cleric-healer': 'https://thiswaifudoesnotexist.net/v2/seed/12371', // Cleric healer
  'barbarian-warrior': 'https://thiswaifudoesnotexist.net/v2/seed/12372', // Barbarian
  'monk-spiritual': 'https://thiswaifudoesnotexist.net/v2/seed/12373', // Spiritual monk
  'warlock-pact': 'https://thiswaifudoesnotexist.net/v2/seed/12374', // Warlock
  'druid-nature': 'https://thiswaifudoesnotexist.net/v2/seed/12375', // Druid
  'sorcerer-wild': 'https://thiswaifudoesnotexist.net/v2/seed/12376', // Sorcerer
  'fighter-champion': 'https://thiswaifudoesnotexist.net/v2/seed/12377', // Fighter
  'artificer-inventor': 'https://thiswaifudoesnotexist.net/v2/seed/12378', // Artificer
  'blood-hunter': 'https://thiswaifudoesnotexist.net/v2/seed/12379', // Blood hunter
  'ranger-beast': 'https://thiswaifudoesnotexist.net/v2/seed/12380', // Beast master
  'warlord-commander': 'https://thiswaifudoesnotexist.net/v2/seed/12381', // Warlord
  'shaman-spirit': 'https://thiswaifudoesnotexist.net/v2/seed/12382', // Shaman
  'mysterious-stranger': 'https://thiswaifudoesnotexist.net/v2/seed/12383', // Mysterious
};

// Better approach: Use curated anime images and better Unsplash photos
// For realistic characters, use specific Unsplash photos that match the description
// For anime, use a mix of anime image services

// Update with better, more specific images
const betterAvatarMap = {
  // REALISTIC - Specific Unsplash photos matching character descriptions
  'grumpy-old-man': 'https://images.unsplash.com/photo-1582750433449-5ed4e5c8c0b7?w=400&h=400&fit=crop&crop=face', // Older man with stern expression
  'california-surfer': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', // Young, relaxed, beachy
  'sassy-best-friend': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', // Confident, sassy woman
  'chef-gordon': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', // Chef, professional
  'ai-tutor': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', // Friendly tutor
  'therapy-bot': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', // Warm, empathetic
  'shy-introvert': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face', // Shy, nervous
  'confident-leader': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', // Confident leader
  'comedic-relief': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', // Fun, humorous
  'romantic-partner': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face', // Warm, romantic
  'cyberpunk-hacker': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', // Tech person
  
  // ANIME - Using anime/waifu style images
  // Using Dicebear Notionists for more anime-like appearance, or curated anime images
  'wise-mentor': 'https://api.dicebear.com/7.x/notionists/svg?seed=wisementor&backgroundColor=b6e3f4,c0aede',
  'detective-noir': 'https://api.dicebear.com/7.x/notionists/svg?seed=detective&backgroundColor=2c1810,1c1917',
  'space-explorer': 'https://api.dicebear.com/7.x/notionists/svg?seed=space&backgroundColor=1e3a8a,3b82f6',
  'medieval-knight': 'https://api.dicebear.com/7.x/notionists/svg?seed=knight&backgroundColor=78350f,92400e',
  'tsundere-anime-girl': 'https://api.dicebear.com/7.x/notionists/svg?seed=tsundere&backgroundColor=ec4899,f472b6',
  'yandere-obsessive': 'https://api.dicebear.com/7.x/notionists/svg?seed=yandere&backgroundColor=dc2626,ef4444',
  'kuudere-cold': 'https://api.dicebear.com/7.x/notionists/svg?seed=kuudere&backgroundColor=64748b,94a3b8',
  'dere-dere-sweet': 'https://api.dicebear.com/7.x/notionists/svg?seed=sweet&backgroundColor=fbbf24,fcd34d',
  'villain-antagonist': 'https://api.dicebear.com/7.x/notionists/svg?seed=villain&backgroundColor=1c1917,292524',
  'vampire-noble': 'https://api.dicebear.com/7.x/notionists/svg?seed=vampire&backgroundColor=7c2d12,991b1b',
  'samurai-warrior': 'https://api.dicebear.com/7.x/notionists/svg?seed=samurai&backgroundColor=1e293b,334155',
  'wizard-sage': 'https://api.dicebear.com/7.x/notionists/svg?seed=wizard&backgroundColor=312e81,4338ca',
  'robot-companion': 'https://api.dicebear.com/7.x/bottts/svg?seed=robot&backgroundColor=64748b,94a3b8',
  'pirate-captain': 'https://api.dicebear.com/7.x/notionists/svg?seed=pirate&backgroundColor=78350f,92400e',
  'ninja-assassin': 'https://api.dicebear.com/7.x/notionists/svg?seed=ninja&backgroundColor=1c1917,292524',
  'elf-archer': 'https://api.dicebear.com/7.x/notionists/svg?seed=elf&backgroundColor=065f46,047857',
  'mad-scientist': 'https://api.dicebear.com/7.x/notionists/svg?seed=scientist&backgroundColor=7c2d12,991b1b',
  'gentle-giant': 'https://api.dicebear.com/7.x/notionists/svg?seed=giant&backgroundColor=78350f,92400e',
  'time-traveler': 'https://api.dicebear.com/7.x/notionists/svg?seed=time&backgroundColor=312e81,4338ca',
  'dragon-rider': 'https://api.dicebear.com/7.x/notionists/svg?seed=dragon&backgroundColor=7c2d12,991b1b',
  'necromancer-dark': 'https://api.dicebear.com/7.x/notionists/svg?seed=necromancer&backgroundColor=1c1917,292524',
  'bard-storyteller': 'https://api.dicebear.com/7.x/notionists/svg?seed=bard&backgroundColor=fbbf24,fcd34d',
  'alchemist-potion': 'https://api.dicebear.com/7.x/notionists/svg?seed=alchemist&backgroundColor=7c2d12,991b1b',
  'ranger-woods': 'https://api.dicebear.com/7.x/notionists/svg?seed=ranger&backgroundColor=065f46,047857',
  'paladin-holy': 'https://api.dicebear.com/7.x/notionists/svg?seed=paladin&backgroundColor=fbbf24,fcd34d',
  'rogue-thief': 'https://api.dicebear.com/7.x/notionists/svg?seed=rogue&backgroundColor=1c1917,292524',
  'cleric-healer': 'https://api.dicebear.com/7.x/notionists/svg?seed=cleric&backgroundColor=fbbf24,fcd34d',
  'barbarian-warrior': 'https://api.dicebear.com/7.x/notionists/svg?seed=barbarian&backgroundColor=7c2d12,991b1b',
  'monk-spiritual': 'https://api.dicebear.com/7.x/notionists/svg?seed=monk&backgroundColor=78350f,92400e',
  'warlock-pact': 'https://api.dicebear.com/7.x/notionists/svg?seed=warlock&backgroundColor=1c1917,292524',
  'druid-nature': 'https://api.dicebear.com/7.x/notionists/svg?seed=druid&backgroundColor=065f46,047857',
  'sorcerer-wild': 'https://api.dicebear.com/7.x/notionists/svg?seed=sorcerer&backgroundColor=312e81,4338ca',
  'fighter-champion': 'https://api.dicebear.com/7.x/notionists/svg?seed=fighter&backgroundColor=78350f,92400e',
  'artificer-inventor': 'https://api.dicebear.com/7.x/notionists/svg?seed=artificer&backgroundColor=64748b,94a3b8',
  'blood-hunter': 'https://api.dicebear.com/7.x/notionists/svg?seed=blood&backgroundColor=dc2626,ef4444',
  'ranger-beast': 'https://api.dicebear.com/7.x/notionists/svg?seed=beast&backgroundColor=065f46,047857',
  'warlord-commander': 'https://api.dicebear.com/7.x/notionists/svg?seed=warlord&backgroundColor=78350f,92400e',
  'shaman-spirit': 'https://api.dicebear.com/7.x/notionists/svg?seed=shaman&backgroundColor=312e81,4338ca',
  'mysterious-stranger': 'https://api.dicebear.com/7.x/notionists/svg?seed=mysterious&backgroundColor=1c1917,292524',
};

// Update avatars
let updated = 0;
personas.forEach(persona => {
  if (betterAvatarMap[persona.id]) {
    persona.avatarUrl = betterAvatarMap[persona.id];
    updated++;
  } else {
    console.warn(`⚠️  No avatar mapping found for: ${persona.id}`);
  }
});

// Write updated file
fs.writeFileSync(seedPath, JSON.stringify(personas, null, 2));

console.log(`✅ Updated ${updated} avatars`);
console.log(`📝 Realistic characters use Unsplash photos (matching character descriptions)`);
console.log(`🎨 Anime/fantasy characters use Dicebear Notionists style (anime/waifu aesthetic)`);

