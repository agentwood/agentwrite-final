/**
 * Pull voice sample for a character
 * 
 * Usage: npx tsx lib/voices/scripts/pull-sample.ts <character_id>
 * 
 * Flow:
 *   1. Load character contract from contracts/
 *   2. Look up character's archetype in registry
 *   3. Get voice_id for that archetype
 *   4. Generate sample using ElevenLabs API
 */

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { config } from "dotenv";

config({ path: ".env.local" });

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVEN_API_KEY) {
    throw new Error("Missing ELEVENLABS_API_KEY env var");
}

const characterId = process.argv[2];
if (!characterId) {
    throw new Error("Usage: npx tsx pull-sample.ts <character_id>");
}

const contractPath = `lib/voices/contracts/${characterId}.json`;
const registryPath = `lib/voices/registry.json`;
const outDir = `lib/voices/samples`;
const outFile = path.join(outDir, `${characterId}.mp3`);

// Load contract
if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract not found: ${contractPath}`);
}
const contract = JSON.parse(fs.readFileSync(contractPath, "utf-8"));

// Load registry
const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

// Get character's archetype from registry
const characterEntry = registry.characters?.[characterId];
if (!characterEntry) {
    throw new Error(`Character "${characterId}" not found in registry.characters`);
}

const archetypeId = characterEntry.archetype;
const archetype = registry.archetypes?.[archetypeId];
if (!archetype) {
    throw new Error(`Archetype "${archetypeId}" not found in registry.archetypes`);
}

if (!archetype.voice_id) {
    throw new Error(`No voice_id assigned to archetype "${archetypeId}". Update registry.json first.`);
}

console.log(`Character: ${contract.display_name}`);
console.log(`Archetype: ${archetypeId}`);
console.log(`Voice ID: ${archetype.voice_id}`);
console.log(`Test Script: "${contract.test_script}"`);
console.log("");

async function run() {
    fs.mkdirSync(outDir, { recursive: true });

    console.log("Generating audio via ElevenLabs...");

    const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${archetype.voice_id}`,
        {
            method: "POST",
            headers: {
                "xi-api-key": ELEVEN_API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: contract.test_script,
                model_id: archetype.model || "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.95,        // High stability = less variance
                    similarity_boost: 0.75, // Lower = more neutral
                    style: 0.0,             // No style exaggeration
                    use_speaker_boost: false,
                },
            }),
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`ElevenLabs API error: ${err}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outFile, buffer);

    console.log(`✔ Generated sample: ${outFile}`);
    console.log(`\nNext: npx tsx lib/voices/tests/run-enforcement.ts`);
}

run();
