#!/usr/bin/env node

/**
 * Safely display API key for identification
 * Shows first 10 and last 10 characters, masking the middle
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

const apiKeyLine = lines.find(line => line.startsWith('GEMINI_API_KEY='));

if (!apiKeyLine) {
  console.error('❌ GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

const apiKey = apiKeyLine.split('=')[1]?.trim();

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY value is empty');
  process.exit(1);
}

// Show first 15 and last 10 characters for identification
const prefix = apiKey.substring(0, 15);
const suffix = apiKey.substring(apiKey.length - 10);
const masked = '*'.repeat(Math.max(0, apiKey.length - 25));

console.log('\n🔑 Your Gemini API Key (for identification):\n');
console.log(`   ${prefix}${masked}${suffix}`);
console.log(`\n   Full length: ${apiKey.length} characters`);
console.log(`   Starts with: ${prefix}`);
console.log(`   Ends with: ${suffix}\n`);

console.log('📋 To upgrade this key:');
console.log('   1. Visit: https://aistudio.google.com/');
console.log('   2. Sign in with the Google account that owns this API key');
console.log('   3. Check your API usage and upgrade your plan');
console.log('   4. The key should start with the prefix shown above\n');




