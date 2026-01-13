export type TTSEngine = 'f5-tts';

export interface RouterDecision {
    engine: TTSEngine;
    reason: string;
}

export interface RouterContext {
    forceEngine?: TTSEngine;
}

export class TTSRouter {
    /**
     * Tree-0 Voice Cluster Routing Logic
     * 
     * Currently only F5-TTS is enabled to ensure all 29 characters
     * maintain their unique voice identity via zero-shot cloning.
     * 
     * Supertonic is disabled until custom presets are created for each
     * of the 29 voice seeds.
     */
    static async decide(character: any, context: RouterContext = {}): Promise<RouterDecision> {
        // F5-TTS is the only engine - ensures unique voices for all 29 characters
        return {
            engine: 'f5-tts',
            reason: 'Zero-shot voice cloning via F5-TTS for character uniqueness',
        };
    }

    /**
     * Get engine status for debugging
     */
    static getClusterStatus(): Record<TTSEngine, boolean> {
        return {
            'f5-tts': !!(process.env.RUNPOD_API_KEY || process.env.RUNPOD_F5_POD_ID),
        };
    }
}
