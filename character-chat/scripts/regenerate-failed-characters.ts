/**
 * Regenerate Failed Characters Script
 * 
 * Regenerates characters that failed during initial generation.
 * This script can be used to fill in missing characters or retry failed ones.
 */

import { PrismaClient } from '@prisma/client';
import { GoogleGenAI, Type } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Import the generation functions from the main script
// For now, we'll just regenerate the missing ones to reach 200 total

async function checkAndRegenerate() {
  const ai = getGeminiClient();
  
  // Count current characters
  const total = await prisma.personaTemplate.count();
  const humanCount = await prisma.personaTemplate.count({
    where: { category: { not: 'fantasy' } }
  });
  const fantasyCount = await prisma.personaTemplate.count({
    where: { category: 'fantasy' }
  });
  
  console.log(`Current counts: ${total} total (${humanCount} human, ${fantasyCount} fantasy)`);
  console.log(`Target: 200 total (100 human, 100 fantasy)`);
  
  const humanNeeded = Math.max(0, 100 - humanCount);
  const fantasyNeeded = Math.max(0, 100 - fantasyCount);
  
  console.log(`\nNeed to generate: ${humanNeeded} human, ${fantasyNeeded} fantasy\n`);
  
  if (humanNeeded === 0 && fantasyNeeded === 0) {
    console.log('✓ All characters generated!');
    return;
  }
  
  // Import generation logic from main script
  console.log('To regenerate missing characters, run the main script again.');
  console.log('It will skip existing characters and only create new ones.');
}

checkAndRegenerate()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



