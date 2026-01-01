import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * SMART VOICE MATCHING: Direct Fish Speech Library Search
 * 
 * Since Character.AI extraction has bot protection, let's be smarter:
 * 1. Search Fish Speech's 1000+ voices for personality matches
 * 2. Test voices with our character text
 * 3. Pick the best match
 * 4. Auto-update mappings
 */

interface VoiceCandidate {
    id: string;
    title: string;
    description?: string;
    matchScore: number;
    reason: string;
}

const CHARACTER_REQUIREMENTS = {
    marjorie: {
        keywords: ['old', 'elderly', 'mature', 'woman', 'female', 'karen', 'angry', 'sharp', 'entitled'],
        avoidKeywords: ['young', 'sweet', 'soft'],
        testText: "Excuse me, I've been a resident of this community for THIRTY years. This is absolutely unacceptable!",
    },
    rajiv: {
        keywords: ['indian', 'friendly', 'warm', 'male', 'man', 'merchant', 'shopkeeper'],
        avoidKeywords: ['angry', 'sad'],
        testText: "Welcome, my friend! I have exactly what you need today. Come in, come in!",
    },
    asha: {
        keywords: ['african', 'kenyan', 'professional', 'woman', 'female', 'clear', 'young'],
        avoidKeywords: ['old', 'childish'],
        testText: "We have to stand up for what's right. This isn't just about us.",
    },
    dex: {
        keywords: ['tough', 'street', 'man', 'male', 'angry', 'raspy', 'urban'],
        avoidKeywords: ['polite', 'formal'],
        testText: "Yo, you think this is a game? I've been grinding in these streets since day one!",
    },
};

async function searchFishVoicesForCharacter(characterId: keyof typeof CHARACTER_REQUIREMENTS) {
    const req = CHARACTER_REQUIREMENTS[characterId];

    console.log(`\n🔍 Searching for ${characterId}...`);
    console.log(`   Keywords: ${req.keywords.join(', ')}`);

    const response = await fetch('https://api.fish.audio/model', {
        headers: { 'Authorization': `Bearer ${process.env.FISH_SPEECH_API_KEY}` },
    });

    const data: any = await response.json();
    const voices = data.items || [];

    // Score each voice
    const candidates: VoiceCandidate[] = voices
        .filter((v: any) => v.languages?.includes('en'))
        .map((v: any) => {
            const text = `${v.title} ${v.description || ''}`.toLowerCase();

            let score = 0;
            const reasons: string[] = [];

            // Positive matches
            for (const keyword of req.keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    score += 2;
                    reasons.push(`+${keyword}`);
                }
            }

            // Negative matches
            for (const keyword of req.avoidKeywords) {
                if (text.includes(keyword.toLowerCase())) {
                    score -= 3;
                    reasons.push(`-${keyword}`);
                }
            }

            return {
                id: v._id,
                title: v.title,
                description: v.description,
                matchScore: score,
                reason: reasons.join(', '),
            };
        })
        .filter(c => c.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

    return candidates.slice(0, 5); // Top 5 matches
}

async function testVoice(voiceId: string, text: string, characterName: string) {
    console.log(`   🎤 Testing voice ${voiceId.substring(0, 8)}...`);

    try {
        const response = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.FISH_SPEECH_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                reference_id: voiceId,
                format: 'mp3',
            }),
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            console.log(`      ❌ Failed (${response.status})`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save test audio
        const outputDir = path.join(process.cwd(), 'voice-tests');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `${characterName}-${voiceId.substring(0, 8)}.mp3`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, buffer);

        console.log(`      ✅ Saved test: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);
        return filepath;

    } catch (error) {
        console.log(`      ❌ Error: ${error}`);
        return null;
    }
}

async function findBestVoicesForAllCharacters() {
    console.log('🎯 SMART VOICE MATCHING FOR ALL CHARACTERS\n');
    console.log('='.repeat(70));

    const bestMatches: Record<string, string> = {};

    for (const characterId of Object.keys(CHARACTER_REQUIREMENTS) as (keyof typeof CHARACTER_REQUIREMENTS)[]) {
        const candidates = await searchFishVoicesForCharacter(characterId);

        if (candidates.length === 0) {
            console.log(`   ⚠️  No matches found for ${characterId}`);
            continue;
        }

        console.log(`\n   Found ${candidates.length} candidates:`);
        for (const [idx, candidate] of candidates.entries()) {
            console.log(`   ${idx + 1}. ${candidate.title} (score: ${candidate.matchScore})`);
            console.log(`      ${candidate.reason}`);
        }

        // Test top candidate
        console.log(`\n   Testing top candidate: ${candidates[0].title}`);
        const testFile = await testVoice(
            candidates[0].id,
            CHARACTER_REQUIREMENTS[characterId].testText,
            characterId
        );

        if (testFile) {
            bestMatches[characterId] = candidates[0].id;
            console.log(`   ✅ Best match for ${characterId}: ${candidates[0].title}`);
        }
    }

    // Output results
    console.log('\n' + '='.repeat(70));
    console.log('\n📝 UPDATE app/api/tts/route.ts with:\n');
    console.log('const FISH_VOICE_MAP: Record<string, string> = {');
    for (const [charId, voiceId] of Object.entries(bestMatches)) {
        console.log(`  '${charId}': '${voiceId}', // Auto-matched`);
    }
    console.log('};');

    console.log('\n🎧 Listen to test samples in: voice-tests/');
    console.log('   Review and run script again with adjusted keywords if needed.\n');
}

// Run
if (require.main === module) {
    findBestVoicesForAllCharacters().catch(console.error);
}

export { findBestVoicesForAllCharacters };
