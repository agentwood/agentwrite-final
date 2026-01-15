import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apiKey = process.env.RUNPOD_API_KEY;
const endpointId = process.env.RUNPOD_F5_ENDPOINT_ID;

async function main() {
    console.log(`Checking RunPod Health for Endpoint: ${endpointId}`);

    if (!apiKey || !endpointId) {
        console.error('❌ Missing API Key or Endpoint ID in environment');
        return;
    }

    try {
        const response = await fetch(`https://api.runpod.ai/v2/${endpointId}/health`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        const data = await response.json();
        console.log('\n--- RunPod Health Report ---');
        console.log(JSON.stringify(data, null, 2));

        if (data.workers) {
            console.log(`\nReady: ${data.workers.ready}`);
            console.log(`Running: ${data.workers.running}`);
            console.log(`Idle: ${data.workers.idle}`);
            console.log(`Initializing: ${data.workers.initializing}`);
        }

    } catch (error: any) {
        console.error('❌ Error fetching health:', error.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
