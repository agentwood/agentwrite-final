/**
 * Gender Match Evaluator
 * Agent 1: Evaluates if TTS voice gender matches character's gender
 */

import { GoogleGenAI } from '@google/genai';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

export interface GenderEvaluationResult {
  score: number; // 1-10
  reasoning: string;
}

/**
 * Evaluate gender match between character and voice
 */
export async function evaluateGenderMatch(
  characterName: string,
  characterGender: 'male' | 'female' | 'neutral' | 'unknown',
  characterDescription: string,
  voiceName: string,
  voiceGender: 'male' | 'female' | 'neutral',
  dialogueText: string,
  audioBase64?: string // Optional: actual TTS audio for evaluation
): Promise<GenderEvaluationResult> {
  const ai = getGeminiClient();

  const prompt = `You are an expert voice-character matching evaluator. Your task is to evaluate if a TTS voice's gender matches a character's gender.

Character:
- Name: ${characterName}
- Gender: ${characterGender}
- Description: ${characterDescription.substring(0, 300)}

Voice:
- Name: ${voiceName}
- Gender: ${voiceGender}

Dialogue Sample: "${dialogueText}"
${audioBase64 ? `\nAudio Sample: [TTS audio generated with voice ${voiceName} - evaluate the actual voice gender from the audio]` : ''}

Evaluate if the voice gender matches the character gender. ${audioBase64 ? 'Listen to the audio sample and evaluate the actual voice gender.' : 'Consider:'}
- Male character should have male voice
- Female character should have female voice
- Neutral character can have any voice
- If character gender is unknown, evaluate based on description

Rate the match from 1-10 where:
- 10 = Perfect gender match
- 8-9 = Good match with minor issues
- 6-7 = Acceptable but noticeable mismatch
- 4-5 = Poor match, clear gender mismatch
- 1-3 = Very poor match, completely wrong gender

Return JSON with this exact format:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation>"
}`;

  // Retry logic with exponential backoff for rate limits
  const maxRetries = 5;
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const evaluation = JSON.parse(result.text || '{}') as GenderEvaluationResult;
      
      // Validate score
      if (evaluation.score < 1 || evaluation.score > 10) {
        evaluation.score = Math.max(1, Math.min(10, evaluation.score || 5));
      }

      return evaluation;
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error.status === 429 || (error.message && error.message.includes('429'))) {
        // Extract retry delay from error if available
        let retryDelay = 60000; // Default 60 seconds
        try {
          const errorData = JSON.parse(error.message || '{}');
          if (errorData.error?.details) {
            const retryInfo = errorData.error.details.find((d: any) => d['@type']?.includes('RetryInfo'));
            if (retryInfo?.retryDelay) {
              retryDelay = Math.max(parseInt(retryInfo.retryDelay) * 1000, 60000);
            }
          }
        } catch {}
        
        // Use exponential backoff with minimum 60 seconds for rate limits
        retryDelay = Math.max(retryDelay, 60000 * (attempt + 1));
        console.log(`⏸️  Rate limit hit, waiting ${Math.round(retryDelay/1000)}s before retry (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // For other errors, break and return default
      break;
    }
  }
  
  console.error(`Error in gender evaluation after ${maxRetries} attempts:`, lastError);
  return {
    score: 5, // Default neutral score
    reasoning: 'Evaluation failed after retries, using default score',
  };
}

