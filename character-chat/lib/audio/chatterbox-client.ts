/**
 * Chatterbox TTS Client
 * Communicates with Chatterbox FastAPI server
 */

export interface ChatterboxSynthesizeOptions {
    emotion?: number // 0.0 - 1.0
    addParalinguisticTags?: boolean
}

export interface ChatterboxResult {
    audio: Buffer
    format: string
    sampleRate: number
    contentType: string
}

export class ChatterboxClient {
    private baseUrl: string
    private timeout: number

    constructor(baseUrl?: string, timeout: number = 30000) {
        this.baseUrl = baseUrl || process.env.CHATTERBOX_API_URL || 'http://localhost:8002'
        this.timeout = timeout
    }

    /**
     * Check if Chatterbox service is configured and available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(`${this.baseUrl}/health`, {
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) return false

            const data = await response.json()
            return data.configured === true
        } catch (error) {
            console.warn('[Chatterbox] Service unavailable:', error)
            return false
        }
    }

    /**
     * Check if Chatterbox is configured (environment check only)
     */
    isConfigured(): boolean {
        // Assume configured if URL is set
        return !!process.env.CHATTERBOX_API_URL || true
    }

    /**
     * Check if reference audio exists for character
     */
    async hasReferenceAudio(characterId: string): Promise<boolean> {
        try {
            const characters = await this.getAvailableCharacters()
            return characters.includes(characterId)
        } catch {
            return false
        }
    }

    /**
     * Get list of available characters
     */
    async getAvailableCharacters(): Promise<string[]> {
        try {
            const response = await fetch(`${this.baseUrl}/characters`)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()
            return data.characters || []
        } catch (error) {
            console.error('[Chatterbox] Failed to fetch characters:', error)
            return []
        }
    }

    /**
     * Synthesize speech from text
     */
    async synthesize(
        text: string,
        characterId: string,
        options: ChatterboxSynthesizeOptions = {}
    ): Promise<ChatterboxResult | null> {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), this.timeout)

            const response = await fetch(`${this.baseUrl}/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    character_id: characterId,
                    emotion: options.emotion ?? 0.5,
                    add_paralinguistic_tags: options.addParalinguisticTags ?? false,
                }),
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const error = await response.json().catch(() => ({}))
                throw new Error(error.detail || `HTTP ${response.status}`)
            }

            const audioBuffer = await response.arrayBuffer()
            const sampleRate = parseInt(response.headers.get('X-Sample-Rate') || '24000')
            const format = response.headers.get('X-Audio-Format') || 'wav'

            return {
                audio: Buffer.from(audioBuffer),
                format,
                sampleRate,
                contentType: 'audio/wav',
            }
        } catch (error: any) {
            console.error('[Chatterbox] Synthesis failed:', error.message)
            return null
        }
    }
}

// Singleton instance
let clientInstance: ChatterboxClient | null = null

export function getChatterboxClient(): ChatterboxClient {
    if (!clientInstance) {
        clientInstance = new ChatterboxClient()
    }
    return clientInstance
}
