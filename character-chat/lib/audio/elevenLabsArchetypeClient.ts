/**
 * ElevenLabs Archetype TTS Client
 * 
 * Simplified TTS using voice archetypes.
 * Each archetype maps to an ElevenLabs voice ID.
 * Characters are mapped to archetypes, not individual voices.
 */

import fs from 'fs';
import path from 'path';

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
    voice_id: string | null;
    provider: string;
    model: string;
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

// Voice settings per emotional range
// Lower stability = more variation (natural pacing, emphasis)
// Higher similarity_boost = more consistent voice timbre
// Style = expressiveness (0 = flat, 1 = dramatic)
const VOICE_SETTINGS_BY_RANGE: Record<string, {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
}> = {
    minimal: { stability: 0.90, similarity_boost: 0.85, style: 0.15, use_speaker_boost: true },
    narrow: { stability: 0.80, similarity_boost: 0.80, style: 0.25, use_speaker_boost: true },
    medium: { stability: 0.65, similarity_boost: 0.75, style: 0.40, use_speaker_boost: true },
    wide: { stability: 0.45, similarity_boost: 0.70, style: 0.55, use_speaker_boost: true },
};

// Character-specific voice setting overrides for special archetypes
// These provide fine-tuned control for key characters
const ARCHETYPE_VOICE_OVERRIDES: Record<string, {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    model_id?: string;
}> = {
    // Villain: Consistent voice identity with dramatic pacing and emphasis
    // Key balance: stability low enough for natural prosody, similarity_boost high for consistent timbre
    'cold_strategic_authority': {
        stability: 0.55,          // Lower for dynamic pacing and natural speech variation
        similarity_boost: 0.95,   // Very high for rock-solid voice identity consistency
        style: 0.45,              // Higher for dramatic emphasis and menacing delivery
        use_speaker_boost: true,
        model_id: 'eleven_multilingual_v2', // Better prosody and natural speech patterns
    },
    // Warm mentor: Calm, consistent, gentle variations
    'warm_mentor': {
        stability: 0.70,          // Higher stability for consistent warmth
        similarity_boost: 0.85,   // Good consistency
        style: 0.30,              // Gentle expressiveness
        use_speaker_boost: true,
        model_id: 'eleven_multilingual_v2',
    },
    // High energy motivator: More variation for excitement
    'high_energy_motivator': {
        stability: 0.45,          // Lower for more dynamic energy
        similarity_boost: 0.80,   // Consistent but not rigid
        style: 0.60,              // High expressiveness for hype
        use_speaker_boost: true,
        model_id: 'eleven_multilingual_v2',
    },
    // Sharp intellectual: Crisp, precise, confident
    'sharp_female_intellectual': {
        stability: 0.65,          // Moderate stability for measured delivery
        similarity_boost: 0.90,   // Strong consistency
        style: 0.35,              // Controlled but still expressive
        use_speaker_boost: true,
        model_id: 'eleven_multilingual_v2',
    },
    // Charismatic rogue: Adventurous, witty, swashbuckling
    'charismatic_rogue': {
        stability: 0.50,          // Dynamic for adventure storytelling
        similarity_boost: 0.85,   // Consistent character
        style: 0.55,              // Expressive and playful
        use_speaker_boost: true,
        model_id: 'eleven_multilingual_v2',
    },
};

// Default voice ID if no archetype mapping exists
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel - neutral female voice

export class ElevenLabsArchetypeClient {
    private apiKey: string;
    private baseUrl = 'https://api.elevenlabs.io/v1';
    private archetypes: Record<string, ArchetypeDefinition> = {};
    private registry: VoiceRegistry | null = null;

    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('[ElevenLabs Archetype] API key not configured');
        }
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
                console.log(`[ElevenLabs Archetype] Loaded ${Object.keys(this.archetypes).length} archetypes`);
            }

            if (fs.existsSync(REGISTRY_PATH)) {
                this.registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
                console.log(`[ElevenLabs Archetype] Registry loaded`);
            }
        } catch (error) {
            console.error('[ElevenLabs Archetype] Failed to load configs:', error);
        }
    }

    /**
     * Check if client is properly configured
     */
    isConfigured(): boolean {
        return !!this.apiKey;
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
     * Get ElevenLabs voice ID for an archetype
     */
    getVoiceIdForArchetype(archetypeId: string): string | null {
        if (!this.registry?.archetypes) return null;
        const mapping = this.registry.archetypes[archetypeId];
        return mapping?.voice_id || null;
    }

    /**
     * Get voice settings based on archetype
     * Checks for character-specific overrides first, then falls back to emotional range defaults
     */
    getVoiceSettings(archetypeId: string): typeof VOICE_SETTINGS_BY_RANGE['minimal'] & { model_id?: string } {
        // Check for archetype-specific override first
        if (ARCHETYPE_VOICE_OVERRIDES[archetypeId]) {
            const override = ARCHETYPE_VOICE_OVERRIDES[archetypeId];
            return {
                stability: override.stability,
                similarity_boost: override.similarity_boost,
                style: override.style,
                use_speaker_boost: override.use_speaker_boost,
                model_id: override.model_id,
            };
        }

        // Fall back to emotional range based settings
        const archetype = this.archetypes[archetypeId];
        if (!archetype) return VOICE_SETTINGS_BY_RANGE.narrow;
        return VOICE_SETTINGS_BY_RANGE[archetype.emotional_range] || VOICE_SETTINGS_BY_RANGE.narrow;
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
            'sharp_female_intellectual': ['scientist', 'expert', 'strategist', 'sharp', 'precise'],
            'gentle_elder': ['grandpa', 'grandfather', 'elderly', 'sage', 'wise elder'],
            'cheerful_optimist': ['cheerful', 'optimist', 'bright', 'upbeat', 'positive', 'happy'],
            'charismatic_rogue': ['rogue', 'pirate', 'thief', 'charming', 'con artist'],
            'eccentric_genius': ['genius', 'inventor', 'mad scientist', 'eccentric', 'professor'],
            'shy_reserved_thinker': ['shy', 'introvert', 'reserved', 'quiet', 'introspective'],
            'fast_talking_operator': ['hustler', 'fixer', 'street-smart', 'fast-talking', 'dealer'],
            'seductive_temptress': ['seductive', 'femme fatale', 'alluring', 'temptress'],
            'clinical_professional': ['doctor', 'scientist', 'clinical', 'forensic', 'professional'],
            'dark_narrator': ['narrator', 'storyteller', 'horror', 'ominous', 'dark'],
            'weathered_veteran': ['veteran', 'retired', 'gravelly', 'experienced', 'world-weary'],
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
     * Synthesize speech using ElevenLabs
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
        if (!this.apiKey) {
            console.error('[ElevenLabs Archetype] API key not configured');
            return null;
        }

        // Step 1: Get archetype for character
        let archetypeId = this.getArchetypeForCharacter(characterId);

        // Step 2: If no mapping, try to auto-detect from profile
        if (!archetypeId && characterProfile) {
            archetypeId = this.detectArchetypeFromProfile(characterProfile);
            if (archetypeId) {
                console.log(`[ElevenLabs Archetype] Auto-detected archetype "${archetypeId}" for ${characterId}`);
            }
        }

        // Step 3: Get voice ID for archetype
        let voiceId: string | null = null;
        if (archetypeId) {
            voiceId = this.getVoiceIdForArchetype(archetypeId);
        }

        // Step 4: Use default if no voice found
        if (!voiceId) {
            console.warn(`[ElevenLabs Archetype] No voice mapping for ${characterId}/${archetypeId}, using default`);
            voiceId = DEFAULT_VOICE_ID;
            archetypeId = 'default';
        }

        // Step 5: Get voice settings (includes model_id if archetype-specific)
        const settings = archetypeId ? this.getVoiceSettings(archetypeId) : VOICE_SETTINGS_BY_RANGE.narrow;

        // Use archetype-specific model if defined, otherwise use turbo v2.5
        const modelId = 'model_id' in settings && settings.model_id
            ? settings.model_id
            : 'eleven_turbo_v2_5';

        console.log(`[ElevenLabs Archetype] Synthesizing for "${characterId}" -> archetype "${archetypeId}" -> voice "${voiceId}" (model: ${modelId})`);

        try {
            const response = await fetch(
                `${this.baseUrl}/text-to-speech/${voiceId}`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': this.apiKey,
                    },
                    body: JSON.stringify({
                        text,
                        model_id: modelId,
                        voice_settings: {
                            stability: settings.stability,
                            similarity_boost: settings.similarity_boost,
                            style: settings.style,
                            use_speaker_boost: settings.use_speaker_boost,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                console.error(`[ElevenLabs Archetype] API error (${response.status}):`, error);
                return null;
            }

            const audio = await response.arrayBuffer();
            console.log(`[ElevenLabs Archetype] ✅ Generated ${audio.byteLength} bytes for ${characterId}`);

            return {
                audio,
                contentType: 'audio/mpeg',
                archetype: archetypeId || 'default'
            };
        } catch (error) {
            console.error('[ElevenLabs Archetype] Synthesis failed:', error);
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
     * Check remaining ElevenLabs quota
     */
    async getQuota(): Promise<{ character_count: number; character_limit: number } | null> {
        if (!this.apiKey) return null;

        try {
            const response = await fetch(`${this.baseUrl}/user/subscription`, {
                headers: { 'xi-api-key': this.apiKey },
            });

            if (!response.ok) return null;

            const data = await response.json();
            return {
                character_count: data.character_count,
                character_limit: data.character_limit,
            };
        } catch (error) {
            return null;
        }
    }
}

// Singleton instance
export const elevenLabsArchetypeClient = new ElevenLabsArchetypeClient();
