/**
 * Chatterbox Archetype TTS Client
 * 
 * Simplified TTS using voice archetypes with self-hosted Chatterbox.
 * Each archetype maps to reference audio + emotion settings.
 * Characters are mapped to archetypes, not individual voice IDs.
 * 
 * COST: ~$50-100/mo GPU server vs ~$2,000+/mo ElevenLabs
 */

import fs from 'fs';
import path from 'path';
import { getChatterboxClient, ChatterboxClient } from './chatterbox-client';

// Types
interface ArchetypeDefinition {
    id: string;
    name: string;
    description: string;
    pitch_range_hz: [number, number];
    tempo_bpm: [number, number];
    max_rms: number;
    emotional_range: 'minimal' | 'narrow' | 'medium' | 'wide';
    qualities: string[];
    character_types: string[];
}

interface ArchetypeVoiceMapping {
    reference_audio: string | null;
    provider: string;
    status: 'active' | 'pending';
    notes: string;
}

interface CharacterMapping {
    archetype: string;
    status: 'mapped' | 'pending';
}

interface VoiceRegistry {
    version: string;
    archetypes: Record<string, ArchetypeVoiceMapping>;
    characters: Record<string, CharacterMapping>;
}

interface ArchetypesFile {
    version: string;
    archetypes: Record<string, ArchetypeDefinition>;
}

// Paths to config files
const ARCHETYPES_PATH = path.join(process.cwd(), 'lib/voices/archetypes.json');
const REGISTRY_PATH = path.join(process.cwd(), 'lib/voices/registry.json');

// Emotion settings per emotional range
// Chatterbox uses emotion 0.0-1.0 (higher = more expressive)
const EMOTION_BY_RANGE: Record<string, number> = {
    minimal: 0.2,   // Cold, controlled
    narrow: 0.35,   // Reserved
    medium: 0.5,    // Balanced
    wide: 0.7,      // Expressive
};

// Character-specific emotion overrides for special archetypes
const ARCHETYPE_EMOTION_OVERRIDES: Record<string, {
    emotion: number;
    addParalinguisticTags: boolean;
}> = {
    // Villain: Controlled but with menacing undertones
    'cold_strategic_authority': {
        emotion: 0.35,
        addParalinguisticTags: false,
    },
    // Warm mentor: Gentle expressiveness
    'warm_mentor': {
        emotion: 0.45,
        addParalinguisticTags: false,
    },
    // High energy motivator: Very expressive
    'high_energy_motivator': {
        emotion: 0.75,
        addParalinguisticTags: true, // [laugh], [wow], etc.
    },
    // Sharp intellectual: Controlled, precise
    'sharp_female_intellectual': {
        emotion: 0.3,
        addParalinguisticTags: false,
    },
    // Charismatic rogue: Adventurous, witty
    'charismatic_rogue': {
        emotion: 0.6,
        addParalinguisticTags: true, // [laugh], [chuckle]
    },
};

export class ChatterboxArchetypeClient {
    private client: ChatterboxClient;
    private archetypes: Record<string, ArchetypeDefinition> = {};
    private registry: VoiceRegistry | null = null;

    constructor() {
        this.client = getChatterboxClient();
        this.loadConfigs();
    }

    /**
     * Load archetype definitions and registry
     */
    private loadConfigs(): void {
        try {
            if (fs.existsSync(ARCHETYPES_PATH)) {
                const archetypesFile: ArchetypesFile = JSON.parse(
                    fs.readFileSync(ARCHETYPES_PATH, 'utf-8')
                );
                this.archetypes = archetypesFile.archetypes;
                console.log(`[Chatterbox Archetype] Loaded ${Object.keys(this.archetypes).length} archetypes`);
            }

            if (fs.existsSync(REGISTRY_PATH)) {
                this.registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
                console.log(`[Chatterbox Archetype] Registry loaded`);
            }
        } catch (error) {
            console.error('[Chatterbox Archetype] Failed to load configs:', error);
        }
    }

    /**
     * Check if client is properly configured
     */
    async isConfigured(): Promise<boolean> {
        return await this.client.isAvailable();
    }

    /**
     * Get archetype for a character
     */
    getArchetypeForCharacter(characterId: string): string | null {
        if (!this.registry?.characters) return null;
        const mapping = this.registry.characters[characterId];
        return mapping?.archetype || null;
    }

    /**
     * Get reference audio path for an archetype
     */
    getReferenceAudioForArchetype(archetypeId: string): string | null {
        if (!this.registry?.archetypes) return null;
        const mapping = this.registry.archetypes[archetypeId];
        return mapping?.reference_audio || null;
    }

    /**
     * Get emotion settings based on archetype
     */
    getEmotionSettings(archetypeId: string): { emotion: number; addParalinguisticTags: boolean } {
        // Check for archetype-specific override first
        if (ARCHETYPE_EMOTION_OVERRIDES[archetypeId]) {
            return ARCHETYPE_EMOTION_OVERRIDES[archetypeId];
        }

        // Fall back to emotional range based settings
        const archetype = this.archetypes[archetypeId];
        const emotion = archetype
            ? EMOTION_BY_RANGE[archetype.emotional_range] || EMOTION_BY_RANGE.medium
            : EMOTION_BY_RANGE.medium;

        return { emotion, addParalinguisticTags: false };
    }

    /**
     * Auto-detect archetype from character description/profile
     */
    detectArchetypeFromProfile(profile: {
        name?: string;
        description?: string;
        category?: string;
        tagline?: string;
    }): string | null {
        const text = `${profile.category || ''} ${profile.tagline || ''} ${profile.description || ''}`.toLowerCase();

        // Keyword-based archetype detection
        const archetypeKeywords: Record<string, string[]> = {
            'cold_strategic_authority': ['villain', 'strategic', 'cold', 'menacing', 'control', 'calculated'],
            'warm_mentor': ['mentor', 'guide', 'teacher', 'wise', 'patient', 'encouraging', 'counselor'],
            'high_energy_motivator': ['coach', 'motivator', 'energetic', 'hype', 'inspiring', 'dynamic'],
            'gruff_enforcer': ['guard', 'soldier', 'tough', 'enforcer', 'rough', 'intimidating'],
            'playful_trickster': ['playful', 'joker', 'mischievous', 'trickster', 'fun', 'prankster'],
            'calm_female_authority': ['leader', 'commander', 'executive', 'confident', 'steady'],
            'warm_female_guide': ['therapist', 'nurse', 'caregiver', 'nurturing', 'empathetic'],
            'sharp_female_intellectual': ['scientist', 'expert', 'strategist', 'sharp', 'precise', 'professor'],
            'gentle_elder': ['grandpa', 'grandfather', 'elderly', 'sage', 'wise elder'],
            'cheerful_optimist': ['cheerful', 'optimist', 'bright', 'upbeat', 'positive', 'happy'],
        };

        for (const [archetype, keywords] of Object.entries(archetypeKeywords)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    return archetype;
                }
            }
        }

        return null;
    }

    /**
     * Synthesize speech using Chatterbox
     */
    async synthesize(
        text: string,
        characterId: string,
        characterProfile?: {
            name?: string;
            description?: string;
            category?: string;
            tagline?: string;
        }
    ): Promise<{ audio: ArrayBuffer; contentType: string; archetype: string } | null> {
        // Check if Chatterbox is available
        const isAvailable = await this.client.isAvailable();
        if (!isAvailable) {
            console.error('[Chatterbox Archetype] Chatterbox server not available');
            return null;
        }

        // Step 1: Get archetype for character
        let archetypeId = this.getArchetypeForCharacter(characterId);

        // Step 2: If no mapping, try to auto-detect from profile
        if (!archetypeId && characterProfile) {
            archetypeId = this.detectArchetypeFromProfile(characterProfile);
            if (archetypeId) {
                console.log(`[Chatterbox Archetype] Auto-detected archetype "${archetypeId}" for ${characterId}`);
            }
        }

        // Step 3: Get emotion settings
        const settings = archetypeId
            ? this.getEmotionSettings(archetypeId)
            : { emotion: 0.5, addParalinguisticTags: false };

        // Step 4: Use character ID as reference audio identifier
        // The Chatterbox server maps character IDs to reference audio files
        const referenceCharacterId = characterId;

        console.log(`[Chatterbox Archetype] Synthesizing for "${characterId}" -> archetype "${archetypeId}" (emotion: ${settings.emotion})`);

        try {
            const result = await this.client.synthesize(text, referenceCharacterId, {
                emotion: settings.emotion,
                addParalinguisticTags: settings.addParalinguisticTags,
            });

            if (!result) {
                console.error(`[Chatterbox Archetype] Synthesis returned null for ${characterId}`);
                return null;
            }

            console.log(`[Chatterbox Archetype] ✅ Generated ${result.audio.length} bytes for ${characterId}`);

            return {
                audio: result.audio.buffer.slice(
                    result.audio.byteOffset,
                    result.audio.byteOffset + result.audio.byteLength
                ) as ArrayBuffer,
                contentType: result.contentType,
                archetype: archetypeId || 'default'
            };
        } catch (error) {
            console.error('[Chatterbox Archetype] Synthesis failed:', error);
            return null;
        }
    }

    /**
     * Get all available archetypes
     */
    getArchetypes(): Record<string, ArchetypeDefinition> {
        return this.archetypes;
    }

    /**
     * Get archetype by ID
     */
    getArchetype(id: string): ArchetypeDefinition | null {
        return this.archetypes[id] || null;
    }

    /**
     * Check available characters on Chatterbox server
     */
    async getAvailableCharacters(): Promise<string[]> {
        return await this.client.getAvailableCharacters();
    }
}

// Singleton instance
export const chatterboxArchetypeClient = new ChatterboxArchetypeClient();
