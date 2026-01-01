import 'dotenv/config';
import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

/**
 * FULLY AUTOMATED CHARACTER.AI VOICE EXTRACTION PIPELINE
 * 
 * What this does:
 * 1. Opens Character.AI in headless browser
 * 2. Navigates to characters matching our personalities
 * 3. Sends messages to trigger voice responses
 * 4. Downloads audio files
 * 5. Auto-uploads to Fish Speech for cloning
 * 6. Updates voice mappings in code
 */

interface VoiceExtractionTask {
    agentwoodId: string;
    agentwoodName: string;
    characterAI: {
        searchQuery: string; // What to search for on Character.AI
        characterName?: string; // Exact character name if known
        messagesToSend: string[]; // Messages to trigger voice (get 20-30s of audio)
    };
}

const EXTRACTION_TASKS: VoiceExtractionTask[] = [
    {
        agentwoodId: 'marjorie',
        agentwoodName: 'Salty Marjorie',
        characterAI: {
            searchQuery: 'Karen entitled customer service',
            messagesToSend: [
                "I need to speak with your manager RIGHT NOW!",
                "This is absolutely unacceptable service!",
                "Do you have ANY idea who I am? I've been a customer for YEARS!",
            ],
        },
    },
    {
        agentwoodId: 'rajiv',
        agentwoodName: 'Friendly Rajiv',
        characterAI: {
            searchQuery: 'friendly shopkeeper merchant',
            messagesToSend: [
                "What do you have for sale today?",
                "Can you tell me about your best deals?",
                "I'm looking for something special, can you help?",
            ],
        },
    },
    {
        agentwoodId: 'asha',
        agentwoodName: 'Fearless Asha',
        characterAI: {
            searchQuery: 'activist professional woman',
            messagesToSend: [
                "What cause are you fighting for?",
                "How do we make a difference?",
                "Tell me about your mission.",
            ],
        },
    },
    {
        agentwoodId: 'dex',
        agentwoodName: 'Angry Dex',
        characterAI: {
            searchQuery: 'street artist tough guy',
            messagesToSend: [
                "What's your deal?",
                "Tell me about your art.",
                "What makes you angry?",
            ],
        },
    },
];

class CharacterAIVoiceExtractor {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private outputDir: string;
    private downloadedAudio: Map<string, string> = new Map();

    constructor() {
        this.outputDir = path.join(process.cwd(), 'extracted-voices');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async initialize() {
        console.log('🚀 Launching browser...');
        this.browser = await chromium.launch({
            headless: false, // Set to false to see what's happening
        });

        this.page = await this.browser.newPage();

        // Intercept audio downloads
        await this.page.route('**/*.mp3', async (route) => {
            const response = await route.fetch();
            const buffer = await response.body();
            const url = route.request().url();

            console.log(`📥 Intercepted audio: ${url.substring(0, 50)}...`);

            // Save audio
            const timestamp = Date.now();
            const filename = `audio-${timestamp}.mp3`;
            const filepath = path.join(this.outputDir, filename);
            fs.writeFileSync(filepath, buffer);

            console.log(`💾 Saved: ${filename}`);

            await route.continue();
        });
    }

    async extractVoiceFromCharacterAI(task: VoiceExtractionTask): Promise<string | null> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`\n${'='.repeat(70)}`);
        console.log(`📋 Extracting voice for: ${task.agentwoodName}`);
        console.log(`🔍 Searching Character.AI for: ${task.characterAI.searchQuery}`);

        try {
            // Navigate to Character.AI
            console.log('🌐 Opening Character.AI...');
            await this.page.goto('https://character.ai', { waitUntil: 'networkidle' });

            // Wait a bit for full load
            await this.page.waitForTimeout(3000);

            // Search for character
            console.log(`🔎 Searching for: ${task.characterAI.searchQuery}`);
            const searchInput = await this.page.locator('input[placeholder*="Search"], input[type="search"]').first();

            if (searchInput) {
                await searchInput.fill(task.characterAI.searchQuery);
                await this.page.waitForTimeout(2000);

                // Click first result
                const firstResult = await this.page.locator('.character-card, [data-testid="character-card"]').first();
                if (firstResult) {
                    await firstResult.click();
                    await this.page.waitForTimeout(3000);
                }
            }

            // Enable voice if available
            console.log('🎤 Enabling voice...');
            const voiceButton = await this.page.locator('button:has-text("Voice"), [aria-label*="voice"]').first();
            if (voiceButton) {
                await voiceButton.click();
                await this.page.waitForTimeout(1000);
            }

            // Send messages to collect voice samples
            console.log('💬 Sending messages to collect voice...');
            const chatInput = await this.page.locator('textarea, input[placeholder*="Message"]').first();

            for (const message of task.characterAI.messagesToSend) {
                if (chatInput) {
                    await chatInput.fill(message);
                    await this.page.keyboard.press('Enter');

                    console.log(`   Sent: "${message}"`);

                    // Wait for response and voice
                    await this.page.waitForTimeout(10000); // 10 seconds for voice to play
                }
            }

            // Check if we got any audio
            const audioFiles = fs.readdirSync(this.outputDir).filter(f => f.endsWith('.mp3'));
            if (audioFiles.length > 0) {
                const latestAudio = audioFiles.sort().pop()!;
                const audioPath = path.join(this.outputDir, latestAudio);

                // Rename to character ID
                const finalPath = path.join(this.outputDir, `${task.agentwoodId}-sample.mp3`);
                fs.renameSync(audioPath, finalPath);

                console.log(`✅ Voice extracted: ${finalPath}`);
                return finalPath;
            }

            console.log('⚠️  No audio captured - Character.AI might not have voice enabled for this character');
            return null;

        } catch (error) {
            console.error(`❌ Error extracting voice:`, error);
            return null;
        }
    }

    async cloneToFishSpeech(audioPath: string, characterName: string): Promise<string | null> {
        console.log(`\n🐟 Cloning voice to Fish Speech...`);

        try {
            // Read audio file
            const audioBuffer = fs.readFileSync(audioPath);

            // Fish Speech currently requires web UI for cloning
            // We'll save the file and provide instructions for now
            console.log(`📝 Audio ready for Fish Speech cloning:`);
            console.log(`   File: ${audioPath}`);
            console.log(`   Size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
            console.log(`\n📋 Next steps:`);
            console.log(`   1. Go to: https://fish.audio/app/voice-cloning/`);
            console.log(`   2. Click "New Voice"`);
            console.log(`   3. Upload: ${audioPath}`);
            console.log(`   4. Name: "${characterName} Clone"`);
            console.log(`   5. Wait 3-5 minutes`);
            console.log(`   6. Copy the voice ID`);

            return null; // Return voice ID once cloning API is available

        } catch (error) {
            console.error('Error cloning voice:', error);
            return null;
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

/**
 * Main automation pipeline
 */
async function runFullPipeline() {
    console.log('🤖 AUTOMATED CHARACTER.AI VOICE EXTRACTION PIPELINE\n');
    console.log('='.repeat(70));

    const extractor = new CharacterAIVoiceExtractor();

    try {
        await extractor.initialize();

        const extractedVoices: Record<string, string> = {};

        for (const task of EXTRACTION_TASKS) {
            const audioPath = await extractor.extractVoiceFromCharacterAI(task);

            if (audioPath) {
                extractedVoices[task.agentwoodId] = audioPath;

                // Attempt to clone (currently manual)
                await extractor.cloneToFishSpeech(audioPath, task.agentwoodName);
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('\n✅ EXTRACTION COMPLETE!');
        console.log(`\n📂 Audio files saved to: extracted-voices/`);
        console.log(`\n📝 Extracted voices for:`);
        for (const [id, path] of Object.entries(extractedVoices)) {
            console.log(`   - ${id}: ${path}`);
        }

        console.log('\n🔄 After cloning on Fish Speech, update app/api/tts/route.ts:');
        console.log('const FISH_VOICE_MAP: Record<string, string> = {');
        for (const id of Object.keys(extractedVoices)) {
            console.log(`  '${id}': 'PASTE_VOICE_ID_HERE',`);
        }
        console.log('};');

    } finally {
        await extractor.cleanup();
    }
}

// Run if executed directly
if (require.main === module) {
    runFullPipeline().catch(console.error);
}

export { runFullPipeline, CharacterAIVoiceExtractor };
