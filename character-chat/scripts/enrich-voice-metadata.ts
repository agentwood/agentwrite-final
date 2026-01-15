#!/usr/bin/env npx tsx
/**
 * Enrich Voice Seeds with Full ElevenLabs Metadata
 * 
 * Fetches complete metadata from ElevenLabs API for all voice IDs
 * in registry.json and updates the VoiceSeed database records.
 * 
 * Usage: ELEVENLABS_API_KEY=your_key npx tsx scripts/enrich-voice-metadata.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVEN_API_KEY) {
    console.error('❌ Missing ELEVENLABS_API_KEY environment variable');
    process.exit(1);
}

// Map our voice seed names to ElevenLabs voice IDs
// Based on registry.json archetypes
const SEED_TO_ELEVENLABS_MAP: Record<string, string> = {
    // Match voice seed names to the ElevenLabs IDs used to generate them
    'Villain': 'dG7SBJDxDoZkQUrwvqrD',        // cold_strategic_authority
    'WiseSage': 'Zlb1dXrM653N07WRdFW3',       // gentle_elder
    'Healer': 'Xb7hH8MSUJpSbSDYk0k2',         // warm_mentor
    'Professor': 'VR6AewLTigWG4xSOukaG',      // dry_technical_explainer
    'Coach': 'pNInz6obpgDQGcFmaJgB',          // high_energy_motivator
    'Coward': 'g5CIjZEefAph4nQFvHAz',         // shy_reserved_thinker
    'FemmeFatale': 'oWAxZDx7w5VEj9dCyTzz',    // seductive_temptress
    'VeterenSoldier': '2EiwWnXFnvU5JabPnv8n', // gruff_enforcer
    'Movetrailer': 'nPczCjzI2devNBz1zQrb',    // dark_narrator
    'Headmistress': 'XB0fDUnXU5powFXDhCwa',   // sharp_female_intellectual
    'Snob': 'GBv7mTt0atIp3Br8iCZE',           // cynical_realist
    'Grandma': 'z9fAnlkpzviPz146aGWa',        // warm_female_guide
    'Youtuber': 'pNInz6obpgDQGcFmaJgB',       // high_energy_motivator
    'Bubbly': 'jsCqWAovK2LkecY7zXl4',         // cheerful_optimist
    'Cockney': '5Q0t7uMcjvnagumLfvZi',        // charismatic_rogue
    'Raspy': 't0jbNlBVZ17f02VDIeMI',          // fierce_rebel
    'Intimate': 'ThT5KcBeYPX3keUQqHPh',       // serene_mystic
    'Male ASMR': 'ThT5KcBeYPX3keUQqHPh',      // serene_mystic (deep version)
    'Meditative': 'ThT5KcBeYPX3keUQqHPh',     // serene_mystic
    'Etheral': 'ThT5KcBeYPX3keUQqHPh',        // serene_mystic (AI version)
    'Nasal': 'g5CIjZEefAph4nQFvHAz',          // shy_reserved_thinker
    'Valley': 'jsCqWAovK2LkecY7zXl4',         // cheerful_optimist (young)
    'Australian': 'IKne3meq5aSn9XLyUdCD',     // fast_talking_operator
    'French': 'oWAxZDx7w5VEj9dCyTzz',         // seductive_temptress (French)
    'Indian': 'pNInz6obpgDQGcFmaJgB',         // high_energy_motivator
    'Scandanavian': '21m00Tcm4TlvDq8ikWAM',   // calm_female_authority
    'WestAfrican': 'pNInz6obpgDQGcFmaJgB',    // high_energy_motivator
    'SouthAfrican': 'N2lVS1w4EtoT3dr4eOWO',   // stoic_protector
    'AfricanAmerican': 'ErXwobaYiN019PkySvjV', // smooth_persuader
};

interface ElevenLabsVoiceDetails {
    voice_id: string;
    name: string;
    description?: string;
    labels?: {
        accent?: string;
        gender?: string;
        age?: string;
        description?: string;
        use_case?: string;
    };
    preview_url?: string;
    category?: string;
}

async function fetchVoiceDetails(voiceId: string): Promise<ElevenLabsVoiceDetails | null> {
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
            headers: { 'xi-api-key': ELEVEN_API_KEY! }
        });

        if (!response.ok) {
            console.error(`❌ Failed to fetch voice ${voiceId}: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error: any) {
        console.error(`❌ Error fetching voice ${voiceId}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🔍 Enriching Voice Seeds with ElevenLabs Metadata\n');

    const allMetadata: Record<string, any> = {};
    let updated = 0;
    let failed = 0;

    for (const [seedName, voiceId] of Object.entries(SEED_TO_ELEVENLABS_MAP)) {
        console.log(`📡 Fetching metadata for ${seedName} (${voiceId})...`);

        const details = await fetchVoiceDetails(voiceId);
        if (!details) {
            failed++;
            continue;
        }

        const labels = details.labels || {};

        // Store full metadata
        allMetadata[seedName] = {
            elevenlabs_voice_id: voiceId,
            elevenlabs_name: details.name,
            description: details.description || labels.description || '',
            accent: labels.accent || 'Unknown',
            gender: labels.gender || 'Unknown',
            age: labels.age || 'Unknown',
            use_case: labels.use_case || 'general',
            preview_url: details.preview_url || null,
            category: details.category || 'premade',
            fetched_at: new Date().toISOString(),
        };

        // Update database
        try {
            const result = await prisma.voiceSeed.updateMany({
                where: { name: seedName },
                data: {
                    description: details.description || labels.description || undefined,
                    accent: labels.accent || undefined,
                    // tone and energy are already set, keep them
                }
            });

            if (result.count > 0) {
                console.log(`✅ Updated ${seedName}: accent="${labels.accent}", gender="${labels.gender}"`);
                updated++;
            } else {
                console.log(`⚠️  VoiceSeed not found in DB: ${seedName}`);
            }
        } catch (error: any) {
            console.error(`❌ DB update failed for ${seedName}:`, error.message);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Save full metadata to JSON
    const outputPath = path.join(process.cwd(), 'lib', 'audio', 'elevenLabsMetadata.json');
    await writeFile(outputPath, JSON.stringify(allMetadata, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Enrichment Complete!`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📋 Full metadata saved to: ${outputPath}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
