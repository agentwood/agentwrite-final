/**
 * Character Contracts
 * Characters are CONTRACTS - specifications that voice assets must satisfy
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Psychological profile for character voice
 */
export interface PsychProfile {
    dominance: number;      // 0-1: How commanding/controlling (affects volume, pace)
    warmth: number;         // 0-1: How friendly/approachable (affects tone softness)
    emotional_variance: number; // 0-1: How much emotion shows (affects pitch variance)
}

/**
 * Voice requirements for a character
 */
export interface VoiceRequirements {
    gender: 'male' | 'female' | 'neutral';
    age_range: [number, number];      // [min, max] years old
    pitch_range_hz: [number, number]; // [min, max] fundamental frequency
    max_pitch_variance: number;        // Max Hz difference (low = controlled)
    max_tempo_bpm: number;             // Max speaking rate
    max_rms: number;                   // Max loudness (0-1)
}

/**
 * Character Contract
 * Defines everything a voice must satisfy for this character
 */
export interface CharacterContract {
    id: string;
    display_name: string;
    archetype: string;
    psych_profile: PsychProfile;
    voice_requirements: VoiceRequirements;
    forbidden_traits: string[];
    test_script: string;

    // Optional metadata
    description?: string;
    notes?: string;
}

/**
 * Contract registry - loaded contracts
 */
const CONTRACT_CACHE: Map<string, CharacterContract> = new Map();

/**
 * Get contracts directory path
 */
function getContractsDir(): string {
    return path.join(__dirname, 'contracts');
}

/**
 * Load a character contract from JSON file
 */
export function loadContract(characterId: string): CharacterContract | null {
    // Check cache first
    if (CONTRACT_CACHE.has(characterId)) {
        return CONTRACT_CACHE.get(characterId)!;
    }

    const contractPath = path.join(getContractsDir(), `${characterId}.json`);

    try {
        if (fs.existsSync(contractPath)) {
            const content = fs.readFileSync(contractPath, 'utf-8');
            const contract = JSON.parse(content) as CharacterContract;
            CONTRACT_CACHE.set(characterId, contract);
            return contract;
        }
    } catch (error) {
        console.error(`Failed to load contract for ${characterId}:`, error);
    }

    return null;
}

/**
 * Load all contracts from the contracts directory
 */
export function loadAllContracts(): CharacterContract[] {
    const contractsDir = getContractsDir();
    const contracts: CharacterContract[] = [];

    try {
        if (fs.existsSync(contractsDir)) {
            const files = fs.readdirSync(contractsDir);

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const characterId = file.replace('.json', '');
                    const contract = loadContract(characterId);
                    if (contract) {
                        contracts.push(contract);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Failed to load contracts:', error);
    }

    return contracts;
}

/**
 * Save a character contract to JSON file
 */
export function saveContract(contract: CharacterContract): boolean {
    const contractPath = path.join(getContractsDir(), `${contract.id}.contract.json`);

    try {
        const contractsDir = getContractsDir();
        if (!fs.existsSync(contractsDir)) {
            fs.mkdirSync(contractsDir, { recursive: true });
        }

        fs.writeFileSync(contractPath, JSON.stringify(contract, null, 2));
        CONTRACT_CACHE.set(contract.id, contract);
        return true;
    } catch (error) {
        console.error(`Failed to save contract for ${contract.id}:`, error);
        return false;
    }
}

/**
 * Validate contract structure
 */
export function validateContractStructure(contract: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!contract || typeof contract !== 'object') {
        return { valid: false, errors: ['Contract must be an object'] };
    }

    const c = contract as Record<string, unknown>;

    // Required fields
    if (typeof c.id !== 'string') errors.push('id must be a string');
    if (typeof c.display_name !== 'string') errors.push('display_name must be a string');
    if (typeof c.archetype !== 'string') errors.push('archetype must be a string');
    if (typeof c.test_script !== 'string') errors.push('test_script must be a string');

    // Psych profile
    if (!c.psych_profile || typeof c.psych_profile !== 'object') {
        errors.push('psych_profile must be an object');
    } else {
        const psych = c.psych_profile as Record<string, unknown>;
        if (typeof psych.dominance !== 'number' || psych.dominance < 0 || psych.dominance > 1) {
            errors.push('psych_profile.dominance must be a number between 0 and 1');
        }
        if (typeof psych.warmth !== 'number' || psych.warmth < 0 || psych.warmth > 1) {
            errors.push('psych_profile.warmth must be a number between 0 and 1');
        }
        if (typeof psych.emotional_variance !== 'number' || psych.emotional_variance < 0 || psych.emotional_variance > 1) {
            errors.push('psych_profile.emotional_variance must be a number between 0 and 1');
        }
    }

    // Voice requirements
    if (!c.voice_requirements || typeof c.voice_requirements !== 'object') {
        errors.push('voice_requirements must be an object');
    } else {
        const vr = c.voice_requirements as Record<string, unknown>;
        if (!['male', 'female', 'neutral'].includes(vr.gender as string)) {
            errors.push('voice_requirements.gender must be male, female, or neutral');
        }
        if (!Array.isArray(vr.age_range) || vr.age_range.length !== 2) {
            errors.push('voice_requirements.age_range must be [min, max]');
        }
        if (!Array.isArray(vr.pitch_range_hz) || vr.pitch_range_hz.length !== 2) {
            errors.push('voice_requirements.pitch_range_hz must be [min, max]');
        }
        if (typeof vr.max_pitch_variance !== 'number') {
            errors.push('voice_requirements.max_pitch_variance must be a number');
        }
        if (typeof vr.max_tempo_bpm !== 'number') {
            errors.push('voice_requirements.max_tempo_bpm must be a number');
        }
        if (typeof vr.max_rms !== 'number') {
            errors.push('voice_requirements.max_rms must be a number');
        }
    }

    // Forbidden traits
    if (!Array.isArray(c.forbidden_traits)) {
        errors.push('forbidden_traits must be an array');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Create a contract from partial data with defaults
 */
export function createContract(partial: Partial<CharacterContract> & { id: string; display_name: string }): CharacterContract {
    return {
        id: partial.id,
        display_name: partial.display_name,
        archetype: partial.archetype || 'default',
        psych_profile: partial.psych_profile || {
            dominance: 0.5,
            warmth: 0.5,
            emotional_variance: 0.5,
        },
        voice_requirements: partial.voice_requirements || {
            gender: 'neutral',
            age_range: [20, 60],
            pitch_range_hz: [80, 300],
            max_pitch_variance: 100,
            max_tempo_bpm: 150,
            max_rms: 0.1,
        },
        forbidden_traits: partial.forbidden_traits || [],
        test_script: partial.test_script || 'Hello, I am a test character.',
        description: partial.description,
        notes: partial.notes,
    };
}
