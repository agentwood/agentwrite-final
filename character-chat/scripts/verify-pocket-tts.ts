
import 'dotenv/config';
import { pocketTtsClient } from '../lib/audio/pocketTtsClient';

async function testConnection() {
    console.log('🔊 Testing Pocket TTS Connection...');

    console.log(`Target URL: ${process.env.POCKET_TTS_URL || 'Falling back to hardcoded URL'}`);

    try {
        const isHealthy = await pocketTtsClient.checkHealth();
        if (isHealthy) {
            console.log('✅ Pocket TTS is REACHABLE and HEALTHY.');
        } else {
            console.log('❌ Pocket TTS is UNREACHABLE.');
        }
    } catch (e) {
        console.error('❌ Error checking health:', e);
    }
}

testConnection();
