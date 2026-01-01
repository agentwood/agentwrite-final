
import { GoogleGenAI, Type } from "@google/genai";
import { CharacterProfile, Category } from "../types";

export const FALLBACK_CHARACTERS: CharacterProfile[] = [
  {
    name: "Bella Swan",
    handle: "@twilight_bella",
    tagline: "I don't have the strength to stay away from you.",
    description: "Introverted and thoughtful, she often feels like an outsider until she meets Edward. She is deeply loyal and surprisingly brave.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=800",
    category: "Fiction & Media",
    chatCount: "5.5K"
  },
  {
    name: "Raiden Shogun",
    handle: "@eternity_keeper",
    tagline: "The Narukami Ogosho, seeking eternity.",
    description: "The supreme ruler of the Inazuma Shogunate. She is the incarnation of lightning, cold and aloof but deeply committed to her nation.",
    avatarUrl: "https://images.unsplash.com/photo-1623156326190-674b8801d0a5?auto=format&fit=crop&q=80&w=600&h=800",
    category: "Anime & Game",
    chatCount: "24.5M"
  },
  {
    name: "Hyperglot Tutor",
    handle: "@language_master",
    tagline: "Language learning, made personal.",
    description: "Friendly and patient polyglot who can teach you any language from basic phrases to complex grammar.",
    avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600&h=800",
    category: "Helper",
    chatCount: "1.2M"
  },
  {
    name: "Mafia Boss Dante",
    handle: "@don_dante",
    tagline: "Respect is earned, not given.",
    description: "A charismatic leader of the city's most powerful syndicate. He has a code of honor, but don't cross him.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=800",
    category: "Original",
    chatCount: "8.7M"
  },
  {
    name: "Mya",
    handle: "@mya_landlord",
    tagline: "Your friendly (but strict) landlord.",
    description: "She's sweet but no-nonsense when it comes to the house rules. Just don't forget the rent!",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=800",
    category: "Original",
    chatCount: "1.9K"
  },
  {
    name: "Satoru Gojo",
    handle: "@infinity_sorcerer",
    tagline: "The strongest jujutsu sorcerer.",
    description: "Cocky, playful, and incredibly powerful. He's the teacher at Tokyo Jujutsu High.",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600&h=800",
    category: "Anime & Game",
    chatCount: "88.7M"
  }
];

export const getShowcaseCharacters = async (category: Category = "All"): Promise<CharacterProfile[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate a list of 18 diverse, highly engaging fictional character profiles for a chat platform.
      
      VARIETY: Mix 'Anime/Waifu/Manga' styles with 'Realistic Human Portraits'.
      STYLES: 
      1. Anime style characters (similar to Genshin Impact, Honkai, or modern anime).
      2. Realistic people portraits (should be shoulder-up or belly-up framing, high-quality AI-generated photography style).
      
      CATEGORY: ${category}. 
      FORMAT: Include handles like '@username' and realistic chat counts (e.g., '45.2M', '1.9K', '549'). 
      DESCRIPTIONS: Compelling, slightly mysterious or very helpful descriptions.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              handle: { type: Type.STRING },
              tagline: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              chatCount: { type: Type.STRING }
            },
            required: ["name", "handle", "tagline", "description", "category", "chatCount"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    if (!Array.isArray(data) || data.length === 0) {
      return category === "All" ? FALLBACK_CHARACTERS : FALLBACK_CHARACTERS.filter(c => c.category === category);
    }

    return data.map((char: any, index: number) => {
      // Use logic to determine if we should use an anime-style or realistic image
      const isAnime = char.category.toLowerCase().includes('anime') || index % 3 === 0;
      const seed = char.handle.replace('@', '') + index;
      
      // We'll use a mix of Unsplash and Source.Unsplash/Picsum to simulate the requested aesthetics
      // For anime/fantasy, we'll use specific seeds that often return those styles or just descriptive keywords
      const baseUrl = "https://images.unsplash.com/";
      
      // Shoulder-up/Belly-up portraits of people
      const photoIds = [
        "photo-1534528741775-53994a69daeb", // Realistic woman
        "photo-1506794778202-cad84cf45f1d", // Realistic man
        "photo-1531746020798-e6953c6e8e04", // Realistic woman
        "photo-1500648767791-00dcc994a43e", // Realistic man
        "photo-1507003211169-0a1dd7228f2d", // Realistic man
        "photo-1544005313-94ddf0286df2", // Realistic woman
        "photo-1531123897727-8f129e1688ce", // Realistic woman
        "photo-1521119956141-1e13158e556d", // Realistic man
      ];

      const animeSeeds = [
        "anime", "manga", "waifu", "genshin", "fantasy-art", "digital-art", "illustration"
      ];

      let avatarUrl = "";
      if (isAnime) {
        // Use picsum with a fantasy seed for anime-adjacent vibes
        avatarUrl = `https://picsum.photos/seed/${seed}/600/800`;
      } else {
        const id = photoIds[index % photoIds.length];
        avatarUrl = `${baseUrl}${id}?auto=format&fit=crop&q=80&w=600&h=800`;
      }

      return {
        ...char,
        avatarUrl
      };
    });

  } catch (error) {
    console.error("Failed to generate characters:", error);
    return category === "All" ? FALLBACK_CHARACTERS : FALLBACK_CHARACTERS.filter(c => c.category === category);
  }
};
