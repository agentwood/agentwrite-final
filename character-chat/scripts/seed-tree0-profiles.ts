import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// === TREE-0 ACOUSTIC PROFILES ===
// These are the "Immutable Acoustic Objects" defined in the mandate.
// Tuning based on archetype descriptions.

const PROFILES: Record<string, {
    pitch: number;    // -5.0 to 5.0 (semitones)
    speed: number;    // 0.5 to 2.0
    energy: number;   // 0.0 to 1.0
    timbre?: string;
    cadence?: string;
    description?: string; // New "human readable" tag
}> = {
    // === AUTHORITY ===
    "Movetrailer": { pitch: -3.0, speed: 0.9, energy: 0.8, timbre: "deep_gravel", cadence: "epic", description: "Deep Epic Narrator" },
    "VeterenSoldier": { pitch: -2.5, speed: 1.0, energy: 0.5, timbre: "rough", cadence: "clipped", description: "Grizzled Sergeant" },
    "FemmeFatale": { pitch: -1.0, speed: 0.9, energy: 0.4, timbre: "smoky", cadence: "seductive", description: "Mysterious Whisper" },
    "Headmistress": { pitch: 0.0, speed: 1.0, energy: 0.7, timbre: "sharp", cadence: "precise", description: "British Authority" },
    "Snob": { pitch: 0.5, speed: 0.95, energy: 0.4, timbre: "nasal_high", cadence: "condescending", description: "Posh Aristocrat" },
    "Villain": { pitch: -2.0, speed: 0.85, energy: 0.3, timbre: "cold_smooth", cadence: "calculated", description: "Calm Mastermind" },

    // === MENTORS ===
    "WiseSage": { pitch: -1.5, speed: 0.8, energy: 0.3, timbre: "warm_cracked", cadence: "thoughtful", description: "Elderly Wisdom" },
    "Healer": { pitch: 0.0, speed: 0.9, energy: 0.4, timbre: "soft_warm", cadence: "empathetic", description: "Gentle Therapist" },
    "Professor": { pitch: -0.5, speed: 1.1, energy: 0.7, timbre: "bright", cadence: "didactic", description: "Enthusiastic Academic" },
    "Meditative": { pitch: -1.0, speed: 0.7, energy: 0.2, timbre: "hollow_calm", cadence: "breathing", description: "Zen Master" },
    "Grandma": { pitch: 1.0, speed: 0.85, energy: 0.5, timbre: "wobbly_warm", cadence: "comforting", description: "Loving Grandmother" },

    // === ENERGETIC ===
    "Youtuber": { pitch: 0.5, speed: 1.25, energy: 0.95, timbre: "shouty_bright", cadence: "rapid_fire", description: "Hype Beast" },
    "Bubbly": { pitch: 1.5, speed: 1.15, energy: 0.9, timbre: "squeaky_bright", cadence: "bouncy", description: "Optimistic Cheerleader" },
    "Cockney": { pitch: 0.0, speed: 1.1, energy: 0.7, timbre: "rough_street", cadence: "rhythmic", description: "Cockney Rogue" },
    "Raspy": { pitch: -1.0, speed: 1.0, energy: 0.6, timbre: "vocal_fry", cadence: "disaffected", description: "Punk Rebel" },
    "Coach": { pitch: -0.5, speed: 1.1, energy: 1.0, timbre: "booming", cadence: "staccato", description: "Screaming Coach" },

    // === TEXTURES ===
    "Intimate": { pitch: -0.5, speed: 0.8, energy: 0.1, timbre: "breathy", cadence: "whisper", description: "Secretive Whisper" },
    "Male ASMR": { pitch: -1.0, speed: 0.7, energy: 0.1, timbre: "soft_bass", cadence: "glacial", description: "Deep Sleep Guide" },
    "Etheral": { pitch: 0.5, speed: 0.9, energy: 0.2, timbre: "metallic_smooth", cadence: "floating", description: "AI Consciousness" },
    "Coward": { pitch: 1.5, speed: 1.1, energy: 0.8, timbre: "shaky", cadence: "stuttering", description: "Nervous Sidekick" },
    "Nasal": { pitch: 2.0, speed: 1.05, energy: 0.6, timbre: "pinched", cadence: "run_on", description: "Stereotypical Nerd" },
    "Valley": { pitch: 1.0, speed: 1.0, energy: 0.5, timbre: "fry_high", cadence: "lilted", description: "Valley Girl" },

    // === GLOBAL ===
    "Australian": { pitch: 0.0, speed: 1.0, energy: 0.6, timbre: "warm_rough", cadence: "drawl", description: "Aussie Adventurer" },
    "French": { pitch: 0.5, speed: 0.95, energy: 0.5, timbre: "soft_breath", cadence: "flowing", description: "Parisian Romantic" },
    "Indian": { pitch: 0.0, speed: 1.15, energy: 0.8, timbre: "crisp", cadence: "rapid", description: "Tech Entrepreneur" },
    "Scandanavian": { pitch: 0.0, speed: 0.9, energy: 0.3, timbre: "cool_clean", cadence: "minimalist", description: "Nordic Designer" },
    "WestAfrican": { pitch: -1.0, speed: 1.05, energy: 0.9, timbre: "rich_deep", cadence: "melodic_preacher", description: "African Motivator" },
    "SouthAfrican": { pitch: -0.5, speed: 0.9, energy: 0.5, timbre: "earthy", cadence: "storyteller", description: "Safari Guide" },
    "AfricanAmerican": { pitch: -2.0, speed: 0.85, energy: 0.4, timbre: "smooth_bass", cadence: "jazz_swing", description: "Cool Jazz Cat" },
};

async function main() {
    console.log("🌳 Seeding Tree-0 v2 Acoustic Profiles...\n");

    let updated = 0;

    for (const [name, profile] of Object.entries(PROFILES)) {
        // Update the VoiceSeed
        try {
            const result = await prisma.voiceSeed.update({
                where: { name: name },
                data: {
                    pitch: profile.pitch,
                    speed: profile.speed,
                    energy: profile.energy,
                    timbre: profile.timbre,
                    cadence: profile.cadence,
                    // Also update legacy description field if needed, or leave it
                }
            });
            console.log(`✅ [${name}] Updated -> Pitch: ${profile.pitch}, Speed: ${profile.speed}, Energy: ${profile.energy}`);
            updated++;
        } catch (e) {
            console.warn(`⚠️ Could not update voice "${name}": Not found in DB?`);
        }
    }

    console.log(`\n✨ Tree-0 Seeding Complete: ${updated} voices updated.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
