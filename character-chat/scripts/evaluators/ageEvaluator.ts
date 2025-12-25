/**
 * Age Match Evaluator
 * Agent 2: Evaluates if TTS voice age characteristics match character's age
 */

import { GoogleGenAI } from '@google/genai';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

export interface AgeEvaluationResult {
  score: number; // 1-10
  reasoning: string;
}

/**
 * Evaluate age match between character and voice
 */
export async function evaluateAgeMatch(
  characterName: string,
  characterAge: 'young' | 'middle' | 'old' | 'unknown',
  characterDescription: string,
  voiceName: string,
  voiceAge: 'young' | 'middle' | 'old',
  dialogueText: string,
  audioBase64?: string
): Promise<AgeEvaluationResult> {
  const ai = getGeminiClient();

  const prompt = `You are an expert voice-character matching evaluator. Your task is to evaluate if a TTS voice's age characteristics match a character's age.

Character:
- Name: ${characterName}
- Age Category: ${characterAge}
- Description: ${characterDescription.substring(0, 300)}

Voice:
- Name: ${voiceName}
- Age Characteristics: ${voiceAge}

Dialogue Sample: "${dialogueText}"
${audioBase64 ? `\nAudio Sample: [TTS audio generated with voice ${voiceName} - evaluate the actual voice age characteristics from the audio]` : ''}

Evaluate if the voice age matches the character age. ${audioBase64 ? 'Listen to the audio sample and evaluate the actual voice age characteristics (pitch, pace, tone).' : 'Consider:'}
- Young character should have young-sounding voice
- Middle-aged character should have mature but not old voice
- Old character should have aged, wise-sounding voice
- Voice pitch, pace, and tone should match age expectations

Rate the match from 1-10 where:
- 10 = Perfect age match
- 8-9 = Good match with minor issues
- 6-7 = Acceptable but noticeable age mismatch
- 4-5 = Poor match, clear age mismatch
- 1-3 = Very poor match, completely wrong age

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

      const evaluation = JSON.parse(result.text || '{}') as AgeEvaluationResult;
      
      // Validate score
      if (evaluation.score < 1 || evaluation.score > 10) {
        evaluation.score = Math.max(1, Math.min(10, evaluation.score || 5));
      }

      return evaluation;
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error.status === 429 || (error.message && error.message.includes('429'))) {
        let retryDelay = 60000;
        try {
          const errorData = JSON.parse(error.message || '{}');
          if (errorData.error?.details) {
            const retryInfo = errorData.error.details.find((d: any) => d['@type']?.includes('RetryInfo'));
            if (retryInfo?.retryDelay) {
              retryDelay = Math.max(parseInt(retryInfo.retryDelay) * 1000, 60000);
            }
          }
        } catch {}
        retryDelay = Math.max(retryDelay, 60000 * (attempt + 1));
        console.log(`⏸️  Rate limit hit, waiting ${Math.round(retryDelay/1000)}s before retry (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // For other errors, break and return default
      break;
    }
  }
  
  console.error(`Error in age evaluation after ${maxRetries} attempts:`, lastError);
  return {
    score: 5, // Default neutral score
    reasoning: 'Evaluation failed after retries, using default score',
  };
}

