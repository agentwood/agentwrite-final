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
  const model = client.getGenerativeModel({ model: "gemini-pro" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};





