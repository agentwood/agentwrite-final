
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async *streamChat(systemInstruction: string, history: Message[], userMessage: string) {
    const chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    });

    const response = await chat.sendMessageStream({ message: userMessage });
    for await (const chunk of response) {
      const c = chunk as GenerateContentResponse;
      yield c.text || '';
    }
  }

  async transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Audio, mimeType } },
            { text: "Transcribe this audio clip into clear, accurate text. Return only the transcription." }
          ]
        }
      });
      return response.text || '';
    } catch (e) {
      console.error("Transcription failed", e);
      return '';
    }
  }

  async suggestTags(name: string, tagline: string, description: string): Promise<string[]> {
    if (!name && !tagline && !description) return [];
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest 5-8 relevant tags for an AI character with the following details:
        Name: ${name}
        Tagline: ${tagline}
        Description: ${description}
        
        Return the tags as a simple JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Tag suggestion failed", e);
      return [];
    }
  }

  async generateAgent(concept: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a detailed AI Agent profile based on this concept: "${concept}". 
      Respond in JSON format with the following properties:
      - name: string (The character's name)
      - role: string (Their title or role)
      - category: One of "Fantasy", "Sports", "Historical", "Sci-Fi", "Villain", "Mentor"
      - description: string (Max 2 sentence bio)
      - systemPrompt: string (Detailed instructions for the AI to play this character)
      - accentColor: string (A tailwind color name like 'orange', 'blue', 'emerald', 'red', 'purple', 'amber')
      - traits: An object containing:
          - aggression: number (0-100)
          - culture: string (Short description of origin/culture)
          - style: string (Short description of appearance/style)
          - voiceName: One of "Zephyr", "Kore", "Puck", "Fenrir", "Charon"`,
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      const text = response.text;
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.error("Failed to parse agent generation", e);
      return null;
    }
  }

  async generateAvatar(prompt: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-quality profile avatar for an AI character: ${prompt}. Minimalist, aesthetic, studio lighting, portrait, digital art style.` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(prompt);
  }
}

export const geminiService = new GeminiService();
