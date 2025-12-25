import { config } from 'dotenv';
import { resolve } from 'path';
import { GoogleGenAI } from '@google/genai';

config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function testQuota() {
  try {
    console.log('Testing API call to check quota status...\n');
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: 'Say "test" only' }] },
      config: { maxOutputTokens: 10 },
    });
    console.log('✅ API call successful - quota available');
    console.log('Response:', result.text?.substring(0, 50));
  } catch (error: any) {
    console.log('❌ API call failed\n');
    if (error.status === 429) {
      console.log('Rate limit/quota error detected');
      try {
        const errorData = typeof error.message === 'string' ? JSON.parse(error.message) : error;
        if (errorData.error) {
          console.log('\nQuota Details:');
          console.log('  Code:', errorData.error.code);
          console.log('  Message:', errorData.error.message);
          if (errorData.error.details) {
            errorData.error.details.forEach((detail: any) => {
              if (detail['@type']?.includes('QuotaFailure')) {
                console.log('\n  Quota Violations:');
                detail.violations?.forEach((v: any) => {
                  console.log('    Metric:', v.quotaMetric);
                  console.log('    Limit:', v.quotaValue || 'Not specified');
                  console.log('    Quota ID:', v.quotaId);
                });
              }
            });
          }
        }
      } catch (e) {
        console.log('Error details:', error.message);
      }
    } else {
      console.log('Error:', error.message || error);
    }
  }
}

testQuota();
