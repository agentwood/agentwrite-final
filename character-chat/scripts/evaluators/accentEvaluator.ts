/**
 * Accent/Cultural Match Evaluator
 * Agent 3: Evaluates if TTS voice accent and cultural characteristics match character's background
 */

import { GoogleGenAI } from '@google/genai';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

export interface AccentEvaluationResult {
  score: number; // 1-10
  reasoning: string;
}

/**
 * Evaluate accent/cultural match between character and voice
 */
export async function evaluateAccentMatch(
  characterName: string,
  characterAccent: string | undefined,
  characterCulture: string | undefined,
  characterDescription: string,
  voiceName: string,
  voiceAccent: string | undefined,
  dialogueText: string,
  audioBase64?: string // Optional: actual TTS audio for evaluation
): Promise<AccentEvaluationResult> {
  const ai = getGeminiClient();

  const accentInfo = characterAccent || characterCulture || 'not specified';
  const voiceAccentInfo = voiceAccent || 'neutral';

  const prompt = `You are an expert voice-character matching evaluator. Your task is to evaluate if a TTS voice's accent and cultural characteristics match a character's background.

Character:
- Name: ${characterName}
- Accent/Cultural Background: ${accentInfo}
- Description: ${characterDescription.substring(0, 300)}

Voice:
- Name: ${voiceName}
- Accent Characteristics: ${voiceAccentInfo}

Dialogue Sample: "${dialogueText}"
${audioBase64 ? `\nAudio Sample: [TTS audio generated with voice ${voiceName} - evaluate the actual accent and pronunciation from the audio]` : ''}

Evaluate if the voice accent matches the character's cultural background. ${audioBase64 ? 'Listen to the audio sample and evaluate the actual accent, pronunciation patterns, and cultural speech characteristics.' : 'Consider:'}
- British character should have British accent
- American character should have American accent
- European character should have European accent
- If accent is not specified, evaluate if voice is culturally appropriate
- Consider dialect, pronunciation patterns, and cultural speech patterns

Rate the match from 1-10 where:
- 10 = Perfect accent/cultural match
- 8-9 = Good match with minor issues
- 6-7 = Acceptable but noticeable accent mismatch
- 4-5 = Poor match, clear accent mismatch
- 1-3 = Very poor match, completely wrong accent/culture

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

      const evaluation = JSON.parse(result.text || '{}') as AccentEvaluationResult;
      
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
  
  console.error(`Error in accent evaluation after ${maxRetries} attempts:`, lastError);
  return {
    score: 5, // Default neutral score
    reasoning: 'Evaluation failed after retries, using default score',
  };
}

