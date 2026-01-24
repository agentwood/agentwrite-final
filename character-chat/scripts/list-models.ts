
import 'dotenv/config';
import { getGeminiClient } from '../lib/geminiClient';

async function listModels() {
    const client = getGeminiClient();
    try {
        const response = await client.models.list();
        console.log('Available models:');
        for (const model of response.models || []) {
            console.log(`- ${model.name}`);
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
