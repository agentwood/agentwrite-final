import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

// Map test audio files to voice names
const TEST_AUDIO_MAP: Record<string, string> = {
  'kore': 'test-1.wav',      // Male, Professional
  'aoede': 'test-2.wav',     // Female, Friendly
  'charon': 'test-3.wav',    // Male, Energetic
  'pulcherrima': 'test-4.wav', // Female, Calm
  'rasalgethi': 'test-5.wav', // Male, Authoritative
};

// Voice gender mapping
const VOICE_GENDER_MAP: Record<string, 'male' | 'female' | 'neutral'> = {
  'kore': 'male',
  'aoede': 'female',
  'charon': 'male',
  'pulcherrima': 'female',
  'rasalgethi': 'male',
};

function extractGender(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('male') || lower.includes('man') || lower.includes('guy') || 
      lower.includes('he ') || lower.includes('his ') || lower.includes('him ')) {
    return 'male';
  }
  if (lower.includes('female') || lower.includes('woman') || lower.includes('girl') ||
      lower.includes('she ') || lower.includes('her ') || lower.includes('hers ')) {
    return 'female';
  }
  return undefined;
}

function extractAge(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('young') || lower.includes('teen') || lower.includes('20s')) {
    return 'young';
  }
  if (lower.includes('middle-aged') || lower.includes('40s') || lower.includes('50s')) {
    return 'middle';
  }
  if (lower.includes('old') || lower.includes('elderly') || lower.includes('senior') ||
      lower.includes('70s') || lower.includes('80s') || lower.includes('retired')) {
    return 'elderly';
  }
  return undefined;
}

function extractPersonality(text: string): string | undefined {
  const lower = text.toLowerCase();
  const traits: string[] = [];
  if (lower.includes('friendly') || lower.includes('warm') || lower.includes('kind')) {
    traits.push('friendly');
  }
  if (lower.includes('professional') || lower.includes('serious') || lower.includes('formal')) {
    traits.push('professional');
  }
  if (lower.includes('energetic') || lower.includes('enthusiastic')) {
    traits.push('energetic');
  }
  if (lower.includes('calm') || lower.includes('soothing')) {
    traits.push('calm');
  }
  if (lower.includes('authoritative') || lower.includes('confident')) {
    traits.push('authoritative');
  }
  return traits.length > 0 ? traits.join(', ') : undefined;
}

function assessMatch(character: any, extracted: any): { quality: 'good' | 'warning' | 'poor'; issues: string[] } {
  const issues: string[] = [];
  const voiceGender = VOICE_GENDER_MAP[character.voiceName.toLowerCase()];
  const charGender = extracted.gender;
  
  if (voiceGender && charGender) {
    if (voiceGender === 'male' && charGender !== 'male') {
      issues.push(`Gender mismatch: Voice is male but character appears ${charGender}`);
    } else if (voiceGender === 'female' && charGender !== 'female') {
      issues.push(`Gender mismatch: Voice is female but character appears ${charGender}`);
    }
  }
  
  let quality: 'good' | 'warning' | 'poor' = 'good';
  if (issues.length > 0) {
    quality = issues.some(i => i.includes('Gender mismatch')) ? 'poor' : 'warning';
  }
  
  return { quality, issues };
}

export async function GET() {
  try {
    // Fetch characters that use the test voices
    const testVoices = Object.keys(TEST_AUDIO_MAP);
    const characters = await db.personaTemplate.findMany({
      where: {
        voiceName: {
          in: testVoices.map(v => v.toLowerCase())
        }
      },
      select: {
        id: true,
        name: true,
        voiceName: true,
        description: true,
        tagline: true,
        category: true,
        archetype: true,
      },
      take: 20,
    });

    const matches = characters.map(char => {
      const fullText = [char.description, char.tagline].filter(Boolean).join(' ');
      
      const extracted = {
        gender: extractGender(fullText),
        age: extractAge(fullText),
        personality: extractPersonality(fullText),
      };
      
      const audioFile = TEST_AUDIO_MAP[char.voiceName.toLowerCase()];
      const { quality, issues } = assessMatch(char, extracted);
      
      return {
        character: char,
        extracted,
        audioFile,
        matchQuality: quality,
        issues,
      };
    });

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('Error fetching voice matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice matches', details: error.message },
      { status: 500 }
    );
  }
}


