
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file in project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testTree0Connection() {
    const endpoint = process.env.RUNPOD_FISH_ENDPOINT;
    const apiKey = process.env.RUNPOD_API_KEY;

    console.log('🌲 Testing Tree-0 Connection...');
    console.log(`📍 Endpoint: ${endpoint}`);
    console.log(`🔑 API Key: ${apiKey ? 'Found (starts with ' + apiKey.substring(0, 4) + '...)' : 'MISSING'}`);

    if (!endpoint || !apiKey) {
        console.error('❌ Missing configuration. Please check .env file.');
        return;
    }

    const payload = {
        input: {
            text: "This is a test of the Tree-0 neural voice engine.",
            pitch: 0.0,
            speed: 1.0,
            character_id: "test_script_user",
            archetype: "neutral"
        }
    };

    try {
        const startTime = Date.now();
        console.log('\n🚀 Sending request to Tree-0...');

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const elapsed = Date.now() - startTime;
        console.log(`⏱️ Request took ${elapsed}ms`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Request failed: ${response.status} ${response.statusText}`);
            console.error(`   Details: ${errorText}`);
            return;
        }

        const data = await response.json();
        console.log('📥 Response received:', JSON.stringify(data, null, 2));

        if (data.status === 'COMPLETED') {
            console.log('✅ Status: ' + data.status);
            if (data.output && data.output.audio) {
                console.log(`🔊 Audio generated! Length: ${data.output.audio.length} chars (base64)`);

                // Optionally save it
                // const buffer = Buffer.from(data.output.audio, 'base64');
                // fs.writeFileSync('test-output.wav', buffer);
                // console.log('💾 Saved to test-output.wav');
            }
        } else if (data.status === 'IN_QUEUE') {
            console.log('⏳ Status: IN_QUEUE - Worker is warming up. Try again in 30 seconds.');
            console.log('   RunPod ID: ' + data.id);
        } else if (data.status === 'IN_PROGRESS') {
            console.log('🔄 Status: IN_PROGRESS - working on it...');
        } else {
            console.log('❓ Status: ' + data.status);
        }

    } catch (error) {
        console.error('❌ Connection error:', error);
    }
}

testTree0Connection();
