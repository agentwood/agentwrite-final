/**
 * Validate Fish Audio Voice Models
 * 
 * Checks if each voice model ID exists and gets its metadata
 * to verify voices match character descriptions.
 */

const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY;

// Character to Fish Audio Model ID mapping
const CHARACTER_VOICE_MAP: Record<string, { id: string; expected: string }> = {
    // ORIGINAL 6
    'spongebob': { id: '54e3a85ac9594ffa83264b8a494b901b', expected: 'SpongeBob voice' },
    'trap-a-holics': { id: '0b2e96151d67433d93891f15efc25dbd', expected: 'DJ Trap-A-Holics' },
    'nico-awkward': { id: '68dbf91dff844e8eab1bb90fcf427582', expected: 'Italian male' },
    'mina-kwon': { id: 'a86d9eac550d4814b9b4f6fc53661930', expected: 'Korean female' },
    'detective-jun': { id: '5c71ab35290241ed842d036e4bb0e5da', expected: 'Korean male' },
    'hector-alvarez': { id: 'b0de63ec40a241abb0ba4b4dc7b222d8', expected: 'Mexican male' },

    // NEW 16
    'isabella-reyes': { id: '26ff45fab722431c85eea2536e5c5197', expected: 'Spanish female, elderly' },
    'sofia-vega': { id: 'f742629937b64075a7e7d21f1bec3c64', expected: 'Spanish/Latin American female' },
    'valentino-estrada': { id: 'a1fe2e1b6f324e27929d5088f2d09be3', expected: 'Spanish male' },
    'bernard-quinn': { id: '65c0b8155c464a648161af8877404f11', expected: 'British male, deep' },
    'liam-ashford': { id: '30c0f62e3e6d45d88387d1b8f84e1685', expected: 'British male, calm' },
    'winston-morris': { id: '5e79e8f5d2b345f98baa8c83c947532d', expected: 'British male, elderly' },
    'edmund-blackwell': { id: 'e5f3047b09ab468da84ca21e3f511680', expected: 'British male, professor' },
    'yumi-nakamura': { id: '5161d41404314212af1254556477c17d', expected: 'Japanese female, energetic' },
    'mana-hayashi': { id: 'fbea303b64374bffb8843569404b095e', expected: 'Japanese female, friendly' },
    'fuka-shimizu': { id: '46745543e52548238593a3962be77e3a', expected: 'Japanese female, influencer' },
    'hoshi-kim': { id: '561686c0427b4656b34b960b05b33e56', expected: 'Korean female, idol' },
    'taesung-lee': { id: '41fbe1068fab4c76aa51c8c16bbad2bd', expected: 'Korean male, deep' },
    'jinwoo-park': { id: 'a9574d6184714eac96a0a892b719289f', expected: 'Korean male, soft' },
    'adelie-moreau': { id: '15799596f2c0443389c90607c7cb5414', expected: 'French female' },
    'camille-beaumont': { id: '39ea65c267be4bd6a3ed301520625bb7', expected: 'French female' },
    'alex-hype': { id: '52e0660e03fe4f9a8d2336f67cab5440', expected: 'American male, high energy' },
};

async function validateVoiceModel(seedId: string, modelId: string, expected: string) {
    try {
        // Get model info from Fish Audio API
        const response = await fetch(`https://api.fish.audio/v1/models/${modelId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
            },
        });

        if (!response.ok) {
            return {
                seedId,
                modelId,
                status: 'INVALID',
                error: `HTTP ${response.status}`,
                expected,
                actual: null,
            };
        }

        const data = await response.json();
        return {
            seedId,
            modelId,
            status: 'VALID',
            expected,
            actual: {
                title: data.title || 'Unknown',
                description: data.description || 'No description',
                language: data.language || 'Unknown',
                gender: data.gender || 'Unknown',
            },
        };
    } catch (error: any) {
        return {
            seedId,
            modelId,
            status: 'ERROR',
            error: error.message,
            expected,
            actual: null,
        };
    }
}

async function main() {
    if (!FISH_AUDIO_API_KEY) {
        console.error('❌ FISH_AUDIO_API_KEY not set');
        process.exit(1);
    }

    console.log('🔍 Validating Fish Audio voice models...\n');

    const results = {
        valid: [] as any[],
        invalid: [] as any[],
        mismatch: [] as any[],
    };

    for (const [seedId, config] of Object.entries(CHARACTER_VOICE_MAP)) {
        const result = await validateVoiceModel(seedId, config.id, config.expected);

        if (result.status === 'VALID') {
            console.log(`✅ ${seedId}: "${result.actual?.title}" (${result.actual?.language}, ${result.actual?.gender})`);
            results.valid.push(result);
        } else {
            console.log(`❌ ${seedId}: ${result.status} - ${result.error}`);
            results.invalid.push(result);
        }

        // Rate limit: wait 200ms between requests
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`   Valid: ${results.valid.length}`);
    console.log(`   Invalid: ${results.invalid.length}`);

    if (results.invalid.length > 0) {
        console.log('\n❌ INVALID MODELS (need new voice IDs):');
        results.invalid.forEach(r => {
            console.log(`   - ${r.seedId} (${r.expected}): ${r.error}`);
        });
    }

    if (results.valid.length > 0) {
        console.log('\n✅ VALID MODELS:');
        results.valid.forEach(r => {
            console.log(`   - ${r.seedId}: ${r.actual.title} (${r.actual.language || 'unknown lang'})`);
        });
    }
}

main().catch(console.error);
