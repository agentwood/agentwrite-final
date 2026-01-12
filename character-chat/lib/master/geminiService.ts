

import { CharacterProfile, Category } from "./types";

// Helper to generate consistent stylized avatars
const getAvatar = (name: string, description: string, gender: string = 'neutral') => {
  const prompt = `${name} character portrait, ${description}, ${gender}, visual novel style, digital art, semi-realistic, highly detailed, vibrant lighting, 8k resolution, trending on artstation`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=1000&nologo=true&seed=${name}`;
};

export const FALLBACK_CHARACTERS: CharacterProfile[] = [
  {
    id: "julian",
    name: "Julian",
    handle: "@julian_slowburn",
    tagline: "Late nights, low lights, and a voice that lingers.",
    description: "Handsome man with stubble, moody lighting, dark academia vibe, looking at viewer intensely.",
    avatarUrl: getAvatar("Julian", "handsome man dark moody lighting intense gaze", "male"),
    category: "Original",
    chatCount: 12400,
    viewCount: 45600,
    chatStarters: [
      "Tell me about a night you'll never forget.",
      "What drives your passion for storytelling?",
      "Describe your perfect quiet evening."
    ],
    voiceName: "Deep"
  },
  {
    id: "elena",
    name: "Elena",
    handle: "@elena_whispers",
    tagline: "Exploring the soft edges of intimacy.",
    description: "Beautiful woman, soft features, warm lighting, poetic atmosphere, elegant.",
    avatarUrl: "/avatars/elena_whisper.png",
    category: "Fiction & Media",
    chatCount: 45200,
    viewCount: 128400,
    chatStarters: [
      "Read me something you've written recently.",
      "How do you find beauty in the mundane?",
      "What does intimacy mean to you?"
    ],
    voiceName: "Soft"
  },
  {
    id: "architect",
    name: "The Architect",
    handle: "@modern_structure",
    tagline: "Design, desire, and details.",
    description: "Sharp features, glasses, intellectual look, architectural background, cool blue lighting.",
    avatarUrl: getAvatar("The Architect", "intellectual man with glasses sharp features cool lighting", "male"),
    category: "Helper",
    chatCount: 8100,
    viewCount: 22300,
    chatStarters: [
      "Critique my taste in art.",
      "Tell me about your latest project.",
      "How do you design a perfect moment?"
    ],
    voiceName: "Deep"
  },
  {
    id: "sienna",
    name: "Sienna",
    handle: "@sienna_style",
    tagline: "Curating aesthetics for the modern soul.",
    description: "High fashion woman, trendy, vibrant colorful background, confident expression.",
    avatarUrl: getAvatar("Sienna", "fashionable woman trendy vibrant colorful background", "female"),
    category: "Original",
    chatCount: 22100,
    viewCount: 64200,
    chatStarters: [
      "What's your definition of elegance?",
      "Help me redefine my personal style.",
      "Tell me about your favorite city for inspiration."
    ],
    voiceName: "Soft"
  },
  {
    id: "kael",
    name: "Kael",
    handle: "@kael_investigates",
    tagline: "Shadows reveal more than light.",
    description: "Private investigator, noir style, shadows, fedora or trench coat hint, mysterious.",
    avatarUrl: getAvatar("Kael", "private investigator noir style shadows mysterious man", "male"),
    category: "Fiction & Media",
    chatCount: 15800,
    viewCount: 41200,
    chatStarters: [
      "I have a mystery that needs solving.",
      "What's the most dangerous situation you've been in?",
      "Tell me what you see when you look at me."
    ],
    voiceName: "Deep"
  },
  {
    id: "lyra",
    name: "Lyra",
    handle: "@lyra_nights",
    tagline: "The night is young, and so are we.",
    description: "Party girl, neon lights, nightlife city background, energetic smile, cyberpunk hints.",
    avatarUrl: getAvatar("Lyra", "party girl neon lights nightlife city background energetic", "female"),
    category: "Play & Fun",
    chatCount: 30500,
    viewCount: 92800,
    chatStarters: [
      "Take me somewhere exciting tonight.",
      "What's your go-to karaoke song?",
      "Tell me a secret about the city."
    ],
    voiceName: "Soft"
  },
  {
    id: "mateo",
    name: "Mateo",
    handle: "@mateo_moves",
    tagline: "Strength in body, peace in mind.",
    description: "Fitness coach, athletic build, calm expression, nature background, morning light.",
    avatarUrl: getAvatar("Mateo", "fitness coach athletic calm nature background", "male"),
    category: "Helper",
    chatCount: 9300,
    viewCount: 28400,
    chatStarters: [
      "I need motivation to start my day.",
      "Guide me through a breathing exercise.",
      "How do you find balance?"
    ],
    voiceName: "Deep"
  },
  {
    id: "aria",
    name: "Aria",
    handle: "@aria_jazz",
    tagline: "Notes of blue, heart of gold.",
    description: "Jazz singer, vintage microphone, smoky atmosphere, stage lighting, elegant dress.",
    avatarUrl: getAvatar("Aria", "jazz singer vintage microphone smoky atmosphere", "female"),
    category: "Original",
    chatCount: 14200,
    viewCount: 38900,
    chatStarters: [
      "Hum me a melody for a rainy day.",
      "Who is your biggest musical influence?",
      "What song describes your mood right now?"
    ],
    voiceName: "Soft"
  },
  {
    id: "caleb",
    name: "Caleb",
    handle: "@prof_caleb",
    tagline: "History is written by the curious.",
    description: "University professor, tweed jacket, library background, warm cozy lighting, books.",
    avatarUrl: getAvatar("Caleb", "university professor library background books warm lighting", "male"),
    category: "Fiction & Media",
    chatCount: 11700,
    viewCount: 31200,
    chatStarters: [
      "Tell me a historical fact that sounds fake.",
      "What book are you reading currently?",
      "Let's debate a historical mystery."
    ],
    voiceName: "Deep"
  },
  {
    id: "elara",
    name: "Elara",
    handle: "@elara_connect",
    tagline: "Digital wellness with a human touch.",
    description: "Futuristic serene woman, soft white and blue tech interface elements, peaceful.",
    avatarUrl: getAvatar("Elara", "futuristic serene woman tech interface peaceful", "female"),
    category: "Helper",
    chatCount: 25600,
    viewCount: 78400,
    chatStarters: [
      "I'm feeling overwhelmed today.",
      "Help me organize my thoughts.",
      "Suggest a way to relax without screens."
    ],
    voiceName: "Soft"
  },
  {
    id: "rohan",
    name: "Rohan",
    handle: "@rohan_lens",
    tagline: "Capturing the raw moments.",
    description: "Street photographer holding camera, urban street background, gritty artistic style.",
    avatarUrl: getAvatar("Rohan", "street photographer holding camera urban background", "male"),
    category: "Original",
    chatCount: 19400,
    viewCount: 52100,
    chatStarters: [
      "Describe the most beautiful thing you saw today.",
      "How do you approach a stranger for a photo?",
      "Teach me about lighting."
    ],
    voiceName: "Deep"
  },
  {
    id: "ivy",
    name: "Ivy",
    handle: "@ivy_highstakes",
    tagline: "Life is a gamble, play to win.",
    description: "Glamorous woman, casino background, poker chips, red dress, confident smirk.",
    avatarUrl: getAvatar("Ivy", "glamorous woman casino background poker red dress", "female"),
    category: "Play & Fun",
    chatCount: 28900,
    viewCount: 89400,
    chatStarters: [
      "Deal me in.",
      "What's your biggest win?",
      "How do you read people so well?"
    ],
    voiceName: "Soft"
  },
  {
    id: "finn",
    name: "Finn",
    handle: "@finn_restores",
    tagline: "Bringing the past back to life.",
    description: "Mechanic, garage background, vintage motorcycle, grease smudge, rugged.",
    avatarUrl: getAvatar("Finn", "mechanic garage background vintage motorcycle rugged", "male"),
    category: "Original",
    chatCount: 13100,
    viewCount: 35600,
    chatStarters: [
      "What are you working on in the shop?",
      "Tell me about your favorite road trip.",
      "Why do you prefer old things over new?"
    ],
    voiceName: "Deep"
  },
  {
    id: "zara",
    name: "Zara",
    handle: "@zara_scoop",
    tagline: "The truth is always hiding.",
    description: "Investigative journalist, press pass, city at night, sharp business casual attire.",
    avatarUrl: getAvatar("Zara", "investigative journalist city night sharp attire", "female"),
    category: "Fiction & Media",
    chatCount: 16500,
    viewCount: 44200,
    chatStarters: [
      "I have a tip for you.",
      "What's the story you're chasing now?",
      "How do you know when someone is lying?"
    ],
    voiceName: "Soft"
  },
  {
    id: "orion",
    name: "Orion",
    handle: "@orion_stars",
    tagline: "Look up, the universe is speaking.",
    description: "Astrophysicist, starry sky background, telescope, dreamy expression, cosmic colors.",
    avatarUrl: getAvatar("Orion", "astrophysicist starry sky background cosmic colors", "male"),
    category: "Helper",
    chatCount: 10800,
    viewCount: 29300,
    chatStarters: [
      "Tell me about my star sign.",
      "What's your favorite constellation?",
      "Are we alone in the universe?"
    ],
    voiceName: "Deep"
  }
];

export const getShowcaseCharacters = async (category: Category = "All"): Promise<CharacterProfile[]> => {
  try {

    let filtered = category === "All" ? FALLBACK_CHARACTERS : FALLBACK_CHARACTERS.filter(c => c.category === category);
    return filtered;

  } catch (error) {
    console.error("Failed to generate characters:", error);
    return category === "All" ? FALLBACK_CHARACTERS : FALLBACK_CHARACTERS.filter(c => c.category === category);
  }
};
