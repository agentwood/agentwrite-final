
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function listEndpoints() {
    const apiKey = process.env.RUNPOD_API_KEY;
    if (!apiKey) {
        console.error('❌ RUNPOD_API_KEY is missing');
        return;
    }

    console.log('🔍 Fetching RunPod Endpoints...');
    try {
        const response = await fetch('https://api.runpod.ai/v2/endpoints', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!response.ok) {
            console.error(`❌ API Error: ${response.status}`);
            return;
        }

        const data: any = await response.json();
        console.log('--- Current Endpoints ---');
        data.forEach((ep: any) => {
            console.log(`- Name: ${ep.name}`);
            console.log(`  ID: ${ep.id}`);
            console.log(`  Status: ${ep.status}`);
            console.log(`  Image: ${ep.imageName}`);
            console.log('-------------------------');
        });
    } catch (e: any) {
        console.error(`❌ Request Failed: ${e.message}`);
    }
}

listEndpoints();
