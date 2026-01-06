import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function main() {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    try {
        const result = await model.generateContent('Hi');
        console.log('Gemini API Key is VALID. Response:', result.response.text());
    } catch (e: any) {
        console.error('Gemini API Key is INVALID or error:', e.message);
    }
}

main();
