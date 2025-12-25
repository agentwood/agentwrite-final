import { config } from 'dotenv';
import { resolve } from 'path';
import { GoogleGenAI } from '@google/genai';

config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error('No API key found');
  process.exit(1);
}

const keyPrefix = apiKey.substring(0, 10);
const keySuffix = apiKey.substring(apiKey.length - 4);
console.log('API Key:', keyPrefix + '...' + keySuffix);
console.log('Length:', apiKey.length);
console.log('');
console.log('To check your tier:');
console.log('1. Go to: https://aistudio.google.com/');
console.log('2. Settings → Usage & Limits');
console.log('3. Look for your key starting with:', keyPrefix);
console.log('');
console.log('Or visit: https://ai.dev/usage?tab=rate-limit');
