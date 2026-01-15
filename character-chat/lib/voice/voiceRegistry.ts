import { db as prisma } from '@/lib/db';

// === TREE-0 v2 FALLBACK MAP ===
// "If this specific voice ID fails, use this exact Fish Audio ID"
// Maps seed.name -> Fish Audio Model ID
const FALLBACK_MAP: Record<string, string> = {
    // === AUTHORITY ===
    "Movetrailer": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Deep Narrator ID
    "VeterenSoldier": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Rough Male ID
    "FemmeFatale": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Smoky Female ID
    "Headmistress": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Posh British Female ID
    "Snob": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Posh British Male ID
    "Villain": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Cold Calculator ID

    // === MENTORS ===
    "WiseSage": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Old Wise Male ID
    "Healer": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Soft Female ID
    "Professor": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Academic Male ID
    "Meditative": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Calm Male ID
    "Grandma": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Old Female ID

    // === ENERGETIC ===
    "Youtuber": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with High Energy Male ID
    "Bubbly": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with High Energy Female ID
    "Cockney": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with British Rogue ID
    "Raspy": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Punk Female ID
    "Coach": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Aggressive Male ID

    // === TEXTURES ===
    "Intimate": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Whisper ID
    "Male ASMR": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Deep Soft Male ID
    "Etheral": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with AI Female ID
    "Coward": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Nervous British ID
    "Nasal": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Nasal Male ID
    "Valley": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Valley Girl ID

    // === GLOBAL ===
    "Australian": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Aussie Male ID
    "French": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with French Female ID
    "Indian": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Indian Male ID
    "Scandanavian": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Nordic Female ID
    "WestAfrican": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with African Male ID
    "SouthAfrican": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with SA Male ID
    "AfricanAmerican": "377190ac47db4570b9255653ae7e6a7c", // TODO: Replace with Black Male ID
};

const GENERIC_FALLBACK = "377190ac47db4570b9255653ae7e6a7c"; // The absolute safety net

export interface ResolvedVoice {
    engine: 'f5' | 'fish';
    voiceId: string; // The ID to send to the engine (filepath for F5, hex ID for Fish)
    params: {
        speed: number;
        pitch: number; // For F5 (if supported) or post-process
        energy: number;
    };
    isFallback: boolean;
}

/**
 * DETERMINISTIC VOICE RESOLVER
 * "No guessing. No runtime matching."
 */
export async function resolveCharacterVoice(characterId: string): Promise<ResolvedVoice> {
    const character = await prisma.personaTemplate.findUnique({
        where: { id: characterId },
        include: { voiceSeed: true }
    });

    if (!character || !character.voiceSeed) {
        console.warn(`[VoiceResolver] Character ${characterId} has NO bound voice. Using generic fallback.`);
        return {
            engine: 'fish',
            voiceId: GENERIC_FALLBACK,
            params: { speed: 1.0, pitch: 0, energy: 0.5 },
            isFallback: true
        };
    }

    const seed = character.voiceSeed;

    // Primary Strategy: F5-TTS
    // Returns the strict parameters from the VoiceSeed
    return {
        engine: 'f5',
        voiceId: seed.name, // In F5 we use the seed name to find the file or the filepath
        params: {
            speed: seed.speed || 1.0,
            pitch: seed.pitch || 0.0,
            energy: seed.energy || 0.5
        },
        isFallback: false
    };
}

export function getFallbackVoice(seedName: string): string {
    return FALLBACK_MAP[seedName] || GENERIC_FALLBACK;
}
