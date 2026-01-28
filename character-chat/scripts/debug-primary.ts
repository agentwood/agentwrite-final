
import { pocketTtsClient } from '../lib/audio/pocketTtsClient';
import * as path from 'path';
import { execSync } from 'child_process';

async function main() {
    console.log("--- TRIGGERING PRIMARY SERVER ERROR ---");

    // 1. Convert MP3 to WAV locally to bypass server codec issues
    const baseDir = process.cwd().endsWith('character-chat') ? process.cwd() : path.join(process.cwd(), 'character-chat');
    const seedsDir = path.join(baseDir, 'public', 'voices', 'seeds');

    // Dynamically find a voice file
    let voiceFile = 'Healer.mp3';
    try {
        const fs = require('fs');
        const files = fs.readdirSync(seedsDir);
        const mp3 = files.find((f: string) => f.endsWith('.mp3'));
        if (mp3) {
            voiceFile = mp3;
            console.log(`[Test] Found voice file: ${voiceFile}`);
        } else {
            console.warn("[Test] No MP3 found in seeds dir, defaulting to Healer.mp3");
        }
    } catch (e) {
        console.warn(`[Test] Could not read seeds dir: ${seedsDir}`);
    }

    const mp3Path = path.join(seedsDir, voiceFile);
    const wavPath = path.join(seedsDir, voiceFile.replace('.mp3', '.wav'));

    console.log(`[Test] Converting ${mp3Path} to WAV...`);
    try {
        // Convert to 24kHz mono WAV (ideal for PocketTTS)
        execSync(`ffmpeg -y -i "${mp3Path}" -ar 24000 -ac 1 -c:a pcm_s16le "${wavPath}"`, { stdio: 'ignore' });
        console.log(`[Test] Conversion successful: ${wavPath}`);
    } catch (e: any) {
        console.error("[Test] FFMPEG conversion failed:", e.message);
        return;
    }

    try {
        console.log(`Sending request to ${process.env.POCKET_TTS_URL}...`);
        // Use relative path so PocketTtsClient resolves it correctly in public/
        // This ensures the client reads the LOCAL WAV file we just created
        await pocketTtsClient.synthesize("This is a test to generate a log entry.", {
            voicePath: `/voices/seeds/${voiceFile.replace('.mp3', '.wav')}`,
            speed: 1.0
        });
        console.log("✅ Success! Server processed the WAV file.");
    } catch (e: any) {
        console.error("❌ Caught Expected Error:");
        console.error(e.message);
    }
}

main();
