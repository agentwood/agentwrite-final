
import { PocketTtsClient } from '../lib/audio/pocketTtsClient';

const PRIMARY_URL = 'http://137.184.82.132:8000';
process.env.POCKET_TTS_BACKUP_URL = process.env.POCKET_TTS_BACKUP_URL || 'http://backup-server-mock:8000';

const originalFetch = global.fetch;

// Define mock fetch separately to avoid casting issues in assignment
const mockFetch: any = async (input: any, init?: any) => {
    const urlStr = input ? input.toString() : '';

    if (urlStr.includes(PRIMARY_URL)) {
        console.log(`[MockFetch] Intercepted PRIMARY request to ${urlStr}. Simulating FAILURE.`);
        throw new TypeError('fetch failed (connection refused)');
    }

    if (urlStr.includes(process.env.POCKET_TTS_BACKUP_URL!)) {
        console.log(`[MockFetch] Intercepted BACKUP request to ${urlStr}. Simulating SUCCESS.`);

        // Mock Response object
        const mockRes = {
            ok: true,
            status: 200,
            statusText: 'OK',
            arrayBuffer: async () => new Uint8Array(1024).buffer,
            text: async () => 'OK',
            headers: new Map()
        };
        return mockRes;
    }

    // Pass through
    if (originalFetch) {
        return originalFetch(input, init);
    }
    return undefined;
};

async function runTest() {
    console.log('--- Starting TTS Fallback Verification ---');

    // Assign mock
    global.fetch = mockFetch;

    try {
        // Create a new instance so it picks up the env var we just set
        const client = new PocketTtsClient();

        console.log('Calling synthesize()...');
        const result = await client.synthesize('Hello fallback world', {
            speed: 1.0
        });

        if (result && result.audio.length === 1024) {
            console.log('✅ Success! Synthesis returned valid audio from backup.');
        } else {
            console.error('❌ Failure! Synthesis returned invalid result:', result);
        }

    } catch (error) {
        console.error('❌ Unexpected error during test:', error);
    } finally {
        // Restore fetch
        global.fetch = originalFetch;
        console.log('--- Test Complete ---');
    }
}

runTest();
