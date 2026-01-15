
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is missing');
        return;
    }
    console.log('Testing Gemini with key:', apiKey.slice(0, 5) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);

    // Test 2.0 Flash
    try {
        console.log('Testing gemini-2.0-flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent('Hello, are you working?');
        console.log('2.0 Flash Response:', result.response.text());
    } catch (e: any) {
        console.error('2.0 Flash Failed:', e.message);
    }

    // Test 1.5 Flash
    try {
        console.log('Testing gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hello, are you working?');
        console.log('1.5 Flash Response:', result.response.text());
    } catch (e: any) {
        console.error('1.5 Flash Failed:', e.message);
    }
}

test();
