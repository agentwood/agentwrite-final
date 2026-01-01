import 'dotenv/config';

/**
 * Fish Speech API Client
 * For A/B testing against OpenVoice/Gemini
 */

const FISH_SPEECH_API_KEY = process.env.FISH_SPEECH_API_KEY || '';
const FISH_SPEECH_BASE_URL = 'https://api.fish.audio/v1';

export interface FishSpeechOptions {
    text: string;
    reference_id?: string; // Pre-made voice ID from Fish Speech
    reference_audio?: string; // URL to audio for cloning
    reference_text?: string; // Transcript of reference audio
    emotion?: string; // e.g., "irritated", "smug", "neutral"
    speed?: number; // 0.5 to 2.0
}

export async function generateFishSpeech(options: FishSpeechOptions): Promise<Buffer> {
    const {
        text,
        reference_id,
        emotion = 'neutral',
        speed = 1.0,
    } = options;

    // For testing, we'll use a pre-made voice or default
    // In production, we'd clone custom voices for each character
    const payload = {
        text: `[${emotion}] ${text}`,
        reference_id: reference_id || 'default-female-en', // Placeholder
        speed,
        format: 'mp3',
    };

    const response = await fetch(`${FISH_SPEECH_BASE_URL}/tts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${FISH_SPEECH_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Fish Speech API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export async function listFishVoices() {
    const response = await fetch(`${FISH_SPEECH_BASE_URL}/voices`, {
        headers: {
            'Authorization': `Bearer ${FISH_SPEECH_API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Fish Speech API error: ${response.statusText}`);
    }

    return response.json();
}
