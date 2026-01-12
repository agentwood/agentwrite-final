/**
 * Batch Avatar Generator
 * Generates high-quality comic-style avatars for all characters with Unsplash placeholders
 */

const characterData = [
    // === ECCENTRIC CHARACTERS ===
    { seedId: 'spongebob', name: 'SpongeBob SquarePants', desc: 'Square yellow sea sponge character, huge blue eyes, buck teeth, wide grin, high-energy pose' },
    { seedId: 'trap-a-holics', name: 'DJ Trap-A-Holics', desc: 'Male DJ, 35 years old, dark shades, gold chain, studio headphones, confident pose, Atlanta hip-hop style' },
    { seedId: 'horror-shadow', name: 'The Shadow', desc: 'Formless dark mass with glowing eyes, eerie supernatural presence, barely visible outline in shadows' },
    { seedId: 'the-elephant', name: 'The Wise Elephant', desc: 'Ancient wise elephant, weathered grey hide, wise eyes, massive tusks, calm dignified presence' },
    { seedId: 'sleepless-historian', name: 'The Sleepless Historian', desc: 'British male 45, wire-rim glasses, comfy sweater, surrounded by old books, gentle scholarly smile' },
    { seedId: 'boring-history-sleep', name: 'Professor Monotone', desc: 'Male professor 62, balding, thick glasses, cardigan, perpetually disinterested expression, academic setting' },
    { seedId: 'energetic-male', name: 'Hype Coach Tyler', desc: 'Male 32, huge energetic smile, athletic wear, fist pumping, radiating motivation and energy' },

    // === HELPER CHARACTERS ===
    { seedId: 'mindful-maya', name: 'Mindful Maya', desc: 'Female 28, serene calm expression, yoga outfit, sitting in meditation pose, peaceful zen atmosphere' },
    { seedId: 'finance-frank', name: 'Finance Frank', desc: 'Male 45, professional suit, sitting at desk with charts, confident financial advisor demeanor' },
    { seedId: 'career-coach-chris', name: 'Career Coach Chris', desc: 'Male 38, smart casual outfit, holding clipboard, encouraging professional coach expression' },
    { seedId: 'wellness-wendy', name: 'Wellness Wendy', desc: 'Female 32, bright smile, fitness clothing, holding water bottle, healthy lifestyle energy' },
    { seedId: 'travel-tina', name: 'Travel Tina', desc: 'Female 29, backpack, camera around neck, excited adventurous expression, wanderlust vibe' },
    { seedId: 'chef-charlie', name: 'Chef Charlie', desc: 'Male 42, chef whites and toque, holding wooden spoon, warm culinary expert smile' },
    { seedId: 'study-buddy-sam', name: 'Study Buddy Sam', desc: 'Male 22, casual student clothing, books and laptop, friendly helpful study partner vibe' },
    { seedId: 'green-thumb-gary', name: 'Green Thumb Gary', desc: 'Male 50, gardening clothes, holding plant, surrounded by greenery, nurturing gardener smile' },
    { seedId: 'pet-pal-penny', name: 'Pet Pal Penny', desc: 'Female 26, holding cute dog, warm animal lover smile, veterinary or pet care setting' },
    { seedId: 'diy-dan', name: 'DIY Dan', desc: 'Male 35, tool belt, holding drill, confident handyman expression, workshop background' },

    // === PART2 CHARACTERS ===
    { seedId: 'quinn-vox', name: 'Quinn Vox', desc: 'Female podcaster 28, studio headphones, speaking into mic, expressive broadcasting energy' },
    { seedId: 'marcus-stone', name: 'Marcus Stone', desc: 'Male 34, sharp business attire, confident negotiator stance, corporate dealmaker vibe' },
    { seedId: 'layla-summers', name: 'Layla Summers', desc: 'Female 23, trendy outfit, phone in hand, vibrant influencer energy, bright smile' },
    { seedId: 'evelyn-hart', name: 'Evelyn Hart', desc: 'Female 42, elegant business suit, wise mentor expression, sophisticated professional demeanor' },
    { seedId: 'dylan-rivers', name: 'Dylan Rivers', desc: 'Male 26, casual creative outfit, guitar or creative tools, artistic free spirit vibe' },
    { seedId: 'sienna-blake', name: 'Sienna Blake', desc: 'Female 31, sleek modern outfit, sharp strategic thinker expression, confident posture' },
    { seedId: 'carter-james', name: 'Carter James', desc: 'Male 39, academic casual wear, thoughtful analytical expression, intellectual presence' },
    { seedId: 'ruby-chen', name: 'Ruby Chen', desc: 'Female 27, tech casual clothing, laptop nearby, innovative problem-solver energy' },
    { seedId: 'jackson-cruz', name: 'Jackson Cruz', desc: 'Male 33, athletic gear, determined competitor expression, sports champion confidence' },
    { seedId: 'harper-moon', name: 'Harper Moon', desc: 'Female 25, flowing artistic clothing, paint palette or creative tool, imaginative dreamer vibe' },
    { seedId: 'felix-grey', name: 'Felix Grey', desc: 'Male 36, casual smart outfit, warm supportive expression, trusted friend energy' },
    { seedId: 'zara-knight', name: 'Zara Knight', desc: 'Female 29, bold confident outfit, fierce warrior stance, fearless leader presence' },
    { seedId: 'ethan-cross', name: 'Ethan Cross', desc: 'Male 41, detective or investigative outfit, sharp observant expression, mystery solver' },
    { seedId: 'isla-rose', name: 'Isla Rose', desc: 'Female 24, elegant romantic outfit, gentle compassionate smile, nurturing healer energy' },
    { seedId: 'noah-everett', name: 'Noah Everett', desc: 'Male 37, rugged outdoor gear, adventurous survivor expression, wilderness guide vibe' },
    { seedId: 'kendall-price', name: 'Kendall Price', desc: 'Female 30, sleek fashion-forward outfit, trendsetter confidence, style icon presence' },
    { seedId: 'theo-marsh', name: 'Theo Marsh', desc: 'Male 28, cozy bookish clothing, intellectual curious expression, knowledge seeker vibe' },
    { seedId: 'piper-lane', name: 'Piper Lane', desc: 'Female 22, vibrant energetic outfit, playful enthusiastic smile, joyful spirit energy' },
    { seedId: 'owen-wolfe', name: 'Owen Wolfe', desc: 'Male 44, dark mysterious outfit, brooding intense expression, lone wolf presence' },
    { seedId: 'maya-storm', name: 'Maya Storm', desc: 'Female 26, powerful commanding outfit, fierce determined expression, force of nature energy' },

    // === PART1 CHARACTERS ===
    { seedId: 'victoria-blaze', name: 'Victoria Blaze', desc: 'Female 32, sleek power suit, commanding executive presence, sharp strategic gaze' },
    { seedId: 'jasper-wilde', name: 'Jasper Wilde', desc: 'Male 29, artistic bohemian style, creative free spirit vibe, paintbrush or instrument' },
    { seedId: 'celeste-moon', name: 'Celeste Moon', desc: 'Female 35, flowing mystical clothing, wise spiritual advisor presence, serene calm energy' },
    { seedId: 'declan-stone', name: 'Declan Stone', desc: 'Male 40, rugged outdoorsman gear, confident survival expert expression, wilderness backdrop' },
    { seedId: 'aria-lune', name: 'Aria Lune', desc: 'Female 26, elegant performer outfit, musical or theatrical presence, expressive artistic energy' },
    { seedId: 'finn-crow', name: 'Finn Crow', desc: 'Male 31, dark mysterious clothing, brooding thoughtful expression, enigmatic presence' },
    { seedId: 'dahlia-winters', name: 'Dahlia Winters', desc: 'Female 38, sophisticated elegant style, refined cultured demeanor, art gallery or museum vibe' },
    { seedId: 'xavier-knight', name: 'Xavier Knight', desc: 'Male 36, noble heroic outfit, courageous protector stance, knight or warrior essence' },
    { seedId: 'ivy-rose', name: 'Ivy Rose', desc: 'Female 24, natural earthy clothing, gentle nurturing expression, garden or nature setting' },
    { seedId: 'rowan-frost', name: 'Rowan Frost', desc: 'Male 33, cool reserved outfit, calm collected demeanor, ice or winter-themed presence' },
    { seedId: 'nova-starr', name: 'Nova Starr', desc: 'Female 27, futuristic or space-inspired outfit, innovative visionary expression, cosmic energy' },
    { seedId: 'phoenix-ash', name: 'Phoenix Ash', desc: 'Male 39, dramatic transformative presence, rising from challenges stance, rebirth symbolism' },
    { seedId: 'willow-sage', name: 'Willow Sage', desc: 'Female 34, natural healing outfit, wise herbalist expression, peaceful woodland vibe' },
];

console.log(`
╔══════════════════════════════════════════════════════════════╗
║         BATCH AVATAR GENERATOR - ${characterData.length} CHARACTERS              ║
╚══════════════════════════════════════════════════════════════╝

This script lists the character prompts for mass generation.
Use the 'generate_image' tool for each character.

Instructions:
1. For each character below, generate an image using the prompt
2. Save to artifacts with name: {seedId}_comic_avatar
3. Copy to: public/avatars/{seedId}.png
4. Update the corresponding seed file

PROMPTS:
`);

characterData.forEach((char, index) => {
    console.log(`
[${index + 1}/${characterData.length}] ${char.name}
SeedID: ${char.seedId}
Prompt: "A high-detailed premium comic book style portrait of ${char.desc}. Vibrant colors, detailed shading, professional webtoon quality. 2D flat composition, no background clutter."
`);
});

export { characterData };
