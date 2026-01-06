import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '../.env.local') });
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    try {
        console.log("Checking available models...");
        // This is a guess on the method name, usually it's listModels in the standard SDK 
        // but @google/genai might be different. Let's just try to hit a known good model or check docs.
    } catch (e) {
        console.error(e);
    }
}

listModels();
