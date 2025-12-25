/**
 * Test Gemini API Key
 * Run with: node scripts/test-api-key.js
 */

require('dotenv').config({ path: '.env' });
const { GoogleGenAI } = require('@google/genai');

async function testApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('\n🔍 Testing Gemini API Key...\n');
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in .env file');
    console.log('   Please add: GEMINI_API_KEY=your_key_here');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...' + apiKey.substring(apiKey.length - 4));
  console.log('   Length:', apiKey.length, 'characters');
  
  if (apiKey.length < 30) {
    console.log('⚠️  Warning: API key seems too short. Expected ~39 characters.');
  }
  
  try {
    console.log('\n📡 Creating Gemini client...');
    const ai = new GoogleGenAI({ apiKey });
    console.log('✅ Client created successfully');
    
    console.log('\n🧪 Testing API call...');
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: 'Say "Hello, API key is working!"' }]
      },
      config: {
        maxOutputTokens: 50,
      }
    });
    
    const responseText = result.text || result.candidates?.[0]?.content?.parts?.[0]?.text || 'No text response';
    
    console.log('✅ API KEY IS VALID!');
    console.log('📝 Response:', responseText.substring(0, 100));
    console.log('\n🎉 Your API key is working correctly!\n');
    
  } catch (error) {
    console.log('\n❌ API KEY TEST FAILED\n');
    console.log('Error:', error.message);
    console.log('Error code:', error.code || 'N/A');
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
      console.log('\n⚠️  The API key appears to be INVALID or EXPIRED');
      console.log('   Get a new key from: https://aistudio.google.com/apikey');
    } else if (error.message.includes('PERMISSION_DENIED') || error.message.includes('403')) {
      console.log('\n⚠️  The API key may not have required permissions');
      console.log('   Check your Google Cloud project settings');
    } else if (error.message.includes('fetch failed') || error.message.includes('network')) {
      console.log('\n⚠️  Network error - check your internet connection');
      console.log('   The API key might be valid but cannot reach Google servers');
    } else {
      console.log('\n⚠️  Unknown error - check the error message above');
    }
    
    console.log('\nFull error:', error);
    process.exit(1);
  }
}

testApiKey();



