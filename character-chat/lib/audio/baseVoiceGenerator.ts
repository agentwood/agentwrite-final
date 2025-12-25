/**
 * Base Voice Generator Utility
 * Helper functions for generating and managing reference audio
 */

import { db } from '../db';
import { getGeminiClient } from '../geminiClient';
import { Modality } from '@google/genai';

export interface ReferenceAudioResult {
  success: boolean;
  audioBase64?: string;
  audioUrl?: string;
  error?: string;
}

/**
 * Generate reference audio for a character using Gemini TTS
 */
export async function generateBaseVoice(
  characterId: string,
  referenceText?: string
): Promise<ReferenceAudioResult> {
  try {
    // Get character from database
    const character = await db.personaTemplate.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        voiceName: true,
        styleHint: true,
        tagline: true,
        description: true,
        greeting: true,
      }
    });

    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    // Generate reference text if not provided
    const text = referenceText || generateReferenceText(character);

    // Generate audio using Gemini TTS
    const ai = getGeminiClient();
    
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: character.voiceName.toLowerCase()
            }
          }
        }
      }
    });

    // Extract audio data
    const audioData = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.includes('audio')
    )?.inlineData?.data;

    if (!audioData) {
      return { success: false, error: 'No audio data returned from API' };
    }

    // Update database
    await db.personaTemplate.update({
      where: { id: characterId },
      data: {
        referenceAudioBase64: audioData,
      }
    });

    return {
      success: true,
      audioBase64: audioData,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate reference audio'
    };
  }
}

/**
 * Generate appropriate reference text for a character
 */
export function generateReferenceText(character: {
  name: string;
  tagline?: string | null;
  description?: string | null;
  greeting?: string | null;
}): string {
  const name = character.name.split(' ')[0]; // First name only
  const profession = character.description?.match(/(\w+)\s+(?:who|that|with)/i)?.[1] || 'person';
  
  // Generate appropriate reference text (3-6 seconds = 15-30 words)
  const templates = [
    `Hello, I'm ${name}. ${character.tagline || `I'm a ${profession} with a unique perspective.`}`,
    `Hi there, my name is ${name}. ${character.greeting || 'Welcome to our conversation.'}`,
    `Greetings, I am ${name}. ${character.description?.substring(0, 80) || 'I have an interesting story to tell.'}`,
  ];
  
  const template = templates[0];
  const words = template.split(' ');
  
  // Ensure text is 3-6 seconds (roughly 15-30 words)
  if (words.length < 15) {
    return `${template} This is a reference audio sample for voice cloning.`;
  } else if (words.length > 30) {
    return words.slice(0, 30).join(' ') + '.';
  }
  
  return template;
}

/**
 * Check if character has reference audio
 */
export async function hasReferenceAudio(characterId: string): Promise<boolean> {
  const character = await db.personaTemplate.findUnique({
    where: { id: characterId },
    select: { referenceAudioBase64: true }
  });

  return !!character?.referenceAudioBase64;
}

/**
 * Get reference audio for a character
 */
export async function getReferenceAudio(characterId: string): Promise<string | null> {
  const character = await db.personaTemplate.findUnique({
    where: { id: characterId },
    select: { referenceAudioBase64: true, referenceAudioUrl: true }
  });

  return character?.referenceAudioBase64 || null;
}




