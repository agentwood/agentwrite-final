
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function test() {
    const apiKey = process.env.RUNPOD_API_KEY;
    const endpoint = process.env.RUNPOD_FISH_ENDPOINT;

    if (!apiKey || !endpoint) {
        console.error('❌ Missing RUNPOD_API_KEY or RUNPOD_FISH_ENDPOINT');
        return;
    }

    console.log(`🚀 Testing RunPod Fish Endpoint: ${endpoint}`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: {
                    text: "Test Fish Speech on RunPod.",
                    // Some fish speech deployments expect specific input schemas
                }
            })
        });

        const data = await response.json();
        console.log('Result:', JSON.stringify(data, null, 2));

    } catch (e: any) {
        console.error(`❌ Request Failed: ${e.message}`);
    }
}

test();
