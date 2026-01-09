/**
 * Fetch available voices from ElevenLabs and suggest archetype mappings
 * Run: npx tsx lib/voices/scripts/fetch-voices.ts
 */

import fs from "fs";
import fetch from "node-fetch";
import { config } from "dotenv";

config({ path: ".env.local" });

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVEN_API_KEY) {
    throw new Error("Missing ELEVENLABS_API_KEY env var");
}

interface ElevenLabsVoice {
    voice_id: string;
    name: string;
    category: string;
    labels: Record<string, string>;
    description: string;
    preview_url: string;
}

interface Archetype {
    id: string;
    name: string;
    description: string;
    pitch_range_hz: [number, number];
    qualities: string[];
    character_types: string[];
}

async function fetchVoices(): Promise<ElevenLabsVoice[]> {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: { "xi-api-key": ELEVEN_API_KEY! },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch voices: ${await res.text()}`);
    }

    const data = await res.json() as { voices: ElevenLabsVoice[] };
    return data.voices;
}

function loadArchetypes(): Record<string, Archetype> {
    const content = fs.readFileSync("lib/voices/archetypes.json", "utf-8");
    const data = JSON.parse(content);
    return data.archetypes;
}

function suggestArchetype(voice: ElevenLabsVoice, archetypes: Record<string, Archetype>): string[] {
    const suggestions: string[] = [];
    const labels = voice.labels || {};
    const desc = (voice.description || "").toLowerCase();
    const name = voice.name.toLowerCase();

    // Map based on labels
    const gender = labels.gender?.toLowerCase();
    const age = labels.age?.toLowerCase();
    const accent = labels.accent?.toLowerCase();
    const useCase = labels.use_case?.toLowerCase();

    // Gender-based filtering
    const isFemale = gender === "female";
    const isMale = gender === "male";

    // Age-based suggestions
    if (age === "old" || age === "middle aged") {
        if (isMale) suggestions.push("weathered_veteran", "gentle_elder", "dark_narrator");
        if (isFemale) suggestions.push("calm_female_authority", "warm_female_guide");
    }
    if (age === "young") {
        suggestions.push("youthful_curious_voice");
        if (isFemale) suggestions.push("cheerful_optimist", "sassy_sidekick");
    }

    // Description-based matching
    if (desc.includes("calm") || desc.includes("soothing")) {
        suggestions.push("warm_mentor", "serene_mystic");
    }
    if (desc.includes("authoritative") || desc.includes("commanding")) {
        if (isMale) suggestions.push("noble_commander", "cold_strategic_authority");
        if (isFemale) suggestions.push("calm_female_authority");
    }
    if (desc.includes("energetic") || desc.includes("dynamic")) {
        suggestions.push("high_energy_motivator", "cheerful_optimist");
    }
    if (desc.includes("deep") || desc.includes("low")) {
        suggestions.push("gruff_enforcer", "stoic_protector", "dark_narrator");
    }
    if (desc.includes("warm") || desc.includes("friendly")) {
        suggestions.push("warm_mentor", "smooth_persuader");
        if (isFemale) suggestions.push("warm_female_guide");
    }
    if (desc.includes("professional") || desc.includes("clear")) {
        suggestions.push("dry_technical_explainer", "clinical_professional");
        if (isFemale) suggestions.push("sharp_female_intellectual");
    }
    if (desc.includes("mysterious") || desc.includes("dark")) {
        suggestions.push("dark_narrator", "cold_strategic_authority");
    }
    if (desc.includes("playful") || desc.includes("fun")) {
        suggestions.push("playful_trickster", "sassy_sidekick");
    }

    // Remove duplicates
    return [...new Set(suggestions)].slice(0, 3);
}

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("   ELEVENLABS VOICE LIBRARY");
    console.log("   Fetching available voices for archetype mapping");
    console.log("═══════════════════════════════════════════════════════════\n");

    const voices = await fetchVoices();
    const archetypes = loadArchetypes();

    console.log(`Found ${voices.length} voices\n`);

    // Group by category
    const byCategory: Record<string, ElevenLabsVoice[]> = {};
    for (const voice of voices) {
        const cat = voice.category || "other";
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(voice);
    }

    // Output for mapping
    const mappingSuggestions: Record<string, any> = {};

    for (const [category, catVoices] of Object.entries(byCategory)) {
        console.log(`\n── ${category.toUpperCase()} ──────────────────────────────────`);

        for (const voice of catVoices) {
            const labels = voice.labels || {};
            const labelStr = Object.entries(labels).map(([k, v]) => `${k}:${v}`).join(", ");
            const suggestions = suggestArchetype(voice, archetypes);

            console.log(`\n  ${voice.name}`);
            console.log(`  ID: ${voice.voice_id}`);
            if (labelStr) console.log(`  Labels: ${labelStr}`);
            if (voice.description) console.log(`  Desc: ${voice.description.slice(0, 80)}...`);
            if (suggestions.length > 0) {
                console.log(`  Suggested archetypes: ${suggestions.join(", ")}`);
            }

            mappingSuggestions[voice.voice_id] = {
                name: voice.name,
                labels,
                suggested_archetypes: suggestions,
            };
        }
    }

    // Save suggestions
    fs.writeFileSync(
        "lib/voices/voice-suggestions.json",
        JSON.stringify(mappingSuggestions, null, 2)
    );
    console.log(`\n\n📄 Suggestions saved: lib/voices/voice-suggestions.json`);

    // Print archetype coverage
    console.log("\n\n═══════════════════════════════════════════════════════════");
    console.log("   ARCHETYPE COVERAGE");
    console.log("═══════════════════════════════════════════════════════════\n");

    const archetypeCounts: Record<string, number> = {};
    for (const arch of Object.keys(archetypes)) {
        archetypeCounts[arch] = 0;
    }

    for (const suggestion of Object.values(mappingSuggestions)) {
        for (const arch of (suggestion as any).suggested_archetypes) {
            if (archetypeCounts[arch] !== undefined) {
                archetypeCounts[arch]++;
            }
        }
    }

    const sorted = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1]);
    for (const [arch, count] of sorted) {
        const bar = "█".repeat(Math.min(count, 20));
        console.log(`  ${arch.padEnd(30)} ${bar} (${count})`);
    }
}

main().catch(console.error);
