/**
 * Overall Voice-Character Fit Evaluator
 * Agent 4: Evaluates overall voice-character match considering all factors
 */

import { GoogleGenAI } from '@google/genai';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

export interface OverallEvaluationResult {
  score: number; // 1-10
  reasoning: string;
}

/**
 * Evaluate overall voice-character fit
 */
export async function evaluateOverallFit(
  characterName: string,
  characterDescription: string,
  characterCategory: string,
  characterArchetype: string,
  voiceName: string,
  voiceDescription: string,
  dialogueText: string,
  audioBase64?: string // Optional: actual TTS audio for evaluation
): Promise<OverallEvaluationResult> {
  const ai = getGeminiClient();

  const prompt = `You are an expert voice-character matching evaluator. Your task is to evaluate the overall fit between a TTS voice and a character, considering all factors holistically.

Character:
- Name: ${characterName}
- Category: ${characterCategory}
- Archetype: ${characterArchetype}
- Description: ${characterDescription.substring(0, 500)}

Voice:
- Name: ${voiceName}
- Characteristics: ${voiceDescription}

Dialogue Sample: "${dialogueText}"
${audioBase64 ? `\nAudio Sample: [TTS audio generated with voice ${voiceName} - evaluate the overall voice-character fit from the actual audio]` : ''}

Evaluate the overall voice-character match considering ${audioBase64 ? 'the actual audio sample and ' : ''}:
- Gender appropriateness
- Age appropriateness
- Accent/cultural fit
- Personality match (tone, style, energy)
- Professional context (if applicable)
- Character archetype alignment
- Overall believability and immersion

Rate the overall match from 1-10 where:
- 10 = Perfect overall match, voice perfectly embodies character
- 8-9 = Excellent match with minor imperfections
- 6-7 = Good match, acceptable for use
- 4-5 = Poor match, noticeable issues
- 1-3 = Very poor match, voice doesn't fit character at all

Return JSON with this exact format:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation covering all factors>"
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

      const evaluation = JSON.parse(result.text || '{}') as OverallEvaluationResult;
      
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
  
  console.error(`Error in overall evaluation after ${maxRetries} attempts:`, lastError);
  return {
    score: 5, // Default neutral score
    reasoning: 'Evaluation failed after retries, using default score',
  };
}

