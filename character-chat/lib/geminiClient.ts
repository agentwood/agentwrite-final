import { GoogleGenAI } from "@google/genai";

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateText = async (prompt: string): Promise<string> => {
  const client = getGeminiClient();

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: prompt }] }]
    });

    if (response.text) {
      return response.text;
    }

    // Fallback for different response structures
    return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};





