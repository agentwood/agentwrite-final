/**
 * Consistency Checker
 * Agent 5: Evaluates if voice maintains consistency across different dialogue contexts
 */

import { GoogleGenAI } from '@google/genai';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

export interface ConsistencyEvaluationResult {
  score: number; // 1-10
  reasoning: string;
}

/**
 * Evaluate voice consistency across multiple dialogue samples
 */
export async function evaluateConsistency(
  characterName: string,
  characterDescription: string,
  voiceName: string,
  dialogueSamples: Array<{ text: string; context: string }>,
  audioSamples?: string[] // Optional: TTS audio samples for each dialogue
): Promise<ConsistencyEvaluationResult> {
  const ai = getGeminiClient();

  const dialoguesList = dialogueSamples.map((d, i) => 
    `${i + 1}. Context: ${d.context}\n   Dialogue: "${d.text}"`
  ).join('\n\n');

  const prompt = `You are an expert voice-character matching evaluator. Your task is to evaluate if a TTS voice maintains consistency across different dialogue contexts for a character.

Character:
- Name: ${characterName}
- Description: ${characterDescription.substring(0, 300)}

Voice: ${voiceName}

Dialogue Samples (5 different contexts):
${dialoguesList}
${audioSamples && audioSamples.length > 0 ? `\nAudio Samples: [${audioSamples.length} TTS audio samples generated with voice ${voiceName} - evaluate consistency by listening to the actual audio]` : ''}

Evaluate if the voice maintains consistency across all dialogue contexts. ${audioSamples && audioSamples.length > 0 ? 'Listen to the audio samples and evaluate if the voice sounds consistent across all contexts.' : 'Consider:'}
- Voice should sound like the same person across all contexts
- Accent should remain consistent
- Tone and style should be consistent (even if emotional state changes)
- Voice characteristics (pitch, pace, etc.) should remain stable
- The voice should feel like one cohesive character, not different people

Rate the consistency from 1-10 where:
- 10 = Perfect consistency, voice is identical across all contexts
- 8-9 = Excellent consistency with minor variations
- 6-7 = Good consistency, acceptable variations
- 4-5 = Poor consistency, noticeable voice changes
- 1-3 = Very poor consistency, voice sounds like different people

Return JSON with this exact format:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation of consistency across contexts>"
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

      const evaluation = JSON.parse(result.text || '{}') as ConsistencyEvaluationResult;
      
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
  
  console.error(`Error in consistency evaluation after ${maxRetries} attempts:`, lastError);
  return {
    score: 5, // Default neutral score
    reasoning: 'Evaluation failed after retries, using default score',
  };
}

