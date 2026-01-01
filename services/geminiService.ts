import { GoogleGenAI, Type } from "@google/genai";
import { CharacterProfile, Category } from "../types";

export const FALLBACK_CHARACTERS: CharacterProfile[] = [
  {
    name: "Julian",
    handle: "@julian_slowburn",
    tagline: "Late nights, low lights, and a voice that lingers.",
    description: "Julian has a way of making you feel like the only person in the room. His stories are slow-paced, intimate, and deeply grounded in the present moment.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=800",
    category: "Original",
    chatCount: "12.4K"
  },
  {
    name: "Elena",
    handle: "@elena_whispers",
    tagline: "Exploring the soft edges of intimacy.",
    description: "A poet at heart, Elena's presence is calming and sophisticated. She values connection and the subtle nuances of shared silence.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=800",
    category: "Fiction & Media",
    chatCount: "45.2K"
  },
  {
    name: "The Architect",
    handle: "@modern_structure",
    tagline: "Design, desire, and details.",
    description: "Precise, thoughtful, and perhaps a bit too observant. He sees the world in lines and shadows, and he's ready to show you his vision.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=800",
    category: "Helper",
    chatCount: "8.1K"
  }
];

export const getShowcaseCharacters = async (category: Category = "All"): Promise<CharacterProfile[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate a list of 18 diverse, sophisticated, and intimate character profiles. 
      The vibe is "Dipsea Stories" - elegant, sensual, lifestyle-oriented, and high-end.
      
      VARIETY: Focus on 'Realistic Human Portraits' with an editorial, magazine-style aesthetic.
      STYLES: Shoulder-up framing, high-quality AI photography, cinematic lighting, warm earthy tones. 
      No anime or cartoonish styles.
      
      CATEGORY: ${category}. 
      FORMAT: Include handles like '@username' and realistic chat counts. 
      DESCRIPTIONS: Use evocative, poetic, and intimate language. Focus on their voice and presence.`,
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
      const seed = char.handle.replace('@', '') + index;
      const baseUrl = "https://images.unsplash.com/";
      
      const photoIds = [
        "photo-1534528741775-53994a69daeb", // Editorial woman
        "photo-1506794778202-cad84cf45f1d", // Rugged man
        "photo-1531746020798-e6953c6e8e04", // Fashion portrait
        "photo-1500648767791-00dcc994a43e", // Businessman portrait
        "photo-1507003211169-0a1dd7228f2d", // Handsome man
        "photo-1544005313-94ddf0286df2", // Natural beauty
        "photo-1531123897727-8f129e1688ce", // Moody portrait
        "photo-1521119956141-1e13158e556d", // Bearded man
        "photo-1494790108377-be9c29b29330", // Happy lifestyle
        "photo-1524504388940-b1c1722653e1", // High fashion woman
      ];

      const id = photoIds[index % photoIds.length];
      const avatarUrl = `${baseUrl}${id}?auto=format&fit=crop&q=80&w=600&h=800`;

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