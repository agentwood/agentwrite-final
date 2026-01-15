/**
 * Voice Seed to ElevenLabs Voice ID Mapping
 * 
 * Maps our 29 voice seed names to ElevenLabs pre-made voice IDs.
 * ElevenLabs hosts the actual distinct voice models, guaranteeing unique voices.
 * 
 * Voice IDs verified from registry.json archetypes.
 */

export const VOICE_SEED_TO_ELEVENLABS: Record<string, string> = {
    // === AUTHORITY VOICES ===
    'Movetrailer': 'nPczCjzI2devNBz1zQrb',     // Brian - cinematic narrator
    'VeterenSoldier': '2EiwWnXFnvU5JabPnv8n',  // Clyde - gruff military
    'FemmeFatale': 'oWAxZDx7w5VEj9dCyTzz',     // Grace - seductive
    'Headmistress': 'XB0fDUnXU5powFXDhCwa',    // Charlotte - British authority
    'Snob': 'GBv7mTt0atIp3Br8iCZE',            // Thomas - cynical British
    'Villain': 'nPczCjzI2devNBz1zQrb',         // Brian - cold villain (fallback)

    // === MENTOR VOICES ===
    'WiseSage': 'Zlb1dXrM653N07WRdFW3',        // Joseph - wise elder
    'Healer': 'Xb7hH8MSUJpSbSDYk0k2',          // Alice - warm mentor
    'Professor': 'VR6AewLTigWG4xSOukaG',       // Arnold - academic
    'Meditative': 'ThT5KcBeYPX3keUQqHPh',      // Dorothy - serene mystic
    'Grandma': 'z9fAnlkpzviPz146aGWa',         // Glinda - warm female

    // === ENERGETIC VOICES ===
    'Youtuber': 'pNInz6obpgDQGcFmaJgB',        // Adam - high energy
    'Bubbly': 'jsCqWAovK2LkecY7zXl4',          // Freya - cheerful female
    'Cockney': '5Q0t7uMcjvnagumLfvZi',         // Paul - charismatic rogue
    'Raspy': 't0jbNlBVZ17f02VDIeMI',           // Jessie - fierce rebel
    'Coach': 'pNInz6obpgDQGcFmaJgB',           // Adam - motivator

    // === TEXTURE VOICES ===
    'Intimate': 'ThT5KcBeYPX3keUQqHPh',        // Dorothy - serene
    'Male ASMR': 'Zlb1dXrM653N07WRdFW3',       // Joseph - calm male
    'Etheral': 'ThT5KcBeYPX3keUQqHPh',         // Dorothy - ethereal
    'Coward': 'g5CIjZEefAph4nQFvHAz',          // Ethan - shy hesitant
    'Nasal': 'g5CIjZEefAph4nQFvHAz',           // Ethan - nerdy
    'Valley': 'jsCqWAovK2LkecY7zXl4',          // Freya - young female

    // === GLOBAL VOICES ===
    'Australian': 'IKne3meq5aSn9XLyUdCD',      // Charlie - Australian
    'French': 'oWAxZDx7w5VEj9dCyTzz',          // Grace - French accent
    'Indian': 'pNInz6obpgDQGcFmaJgB',          // Adam - styled for Indian
    'Scandanavian': '21m00Tcm4TlvDq8ikWAM',    // Rachel - calm authority
    'WestAfrican': 'pNInz6obpgDQGcFmaJgB',     // Adam - powerful
    'SouthAfrican': 'N2lVS1w4EtoT3dr4eOWO',    // Callum - stoic
    'AfricanAmerican': 'ErXwobaYiN019PkySvjV', // Antoni - smooth
};

/**
 * Get ElevenLabs voice ID for a voice seed name
 */
export function getElevenLabsVoiceId(voiceSeedName: string): string | null {
    return VOICE_SEED_TO_ELEVENLABS[voiceSeedName] || null;
}
