/**
 * Voice Sharing Analysis Script
 * Identifies which characters need unique clones vs acceptable shares
 */

import xlsx from 'xlsx';
import path from 'path';

interface Character {
    name: string;
    seedId: string;
    voiceType: string;
    gender: string;
    heritage: string;
    age: string;
    fishAudioId: string;
}

async function analyze() {
    const xlsPath = path.resolve(process.cwd(), 'data/comprehensive-character-data.xlsx');
    const workbook = xlsx.readFile(xlsPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Group by Fish Audio ID
    const voiceGroups: Record<string, Character[]> = {};

    data.forEach((row: any) => {
        const id = row['Fish Audio Model ID'];
        const char: Character = {
            name: row['Name'] || '',
            seedId: row['Seed ID'] || row['seedId'] || '',
            voiceType: row['Voice Type'] || '',
            gender: row['Gender'] || '',
            heritage: row['Heritage'] || '',
            age: row['Age'] || '',
            fishAudioId: id
        };

        if (!voiceGroups[id]) {
            voiceGroups[id] = [];
        }
        voiceGroups[id].push(char);
    });

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           VOICE SHARING ANALYSIS - 35 CHARACTERS           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Unique voices
    const uniqueVoices: Character[] = [];
    const sharedGroups: { primary: Character; shared: Character[] }[] = [];

    Object.values(voiceGroups).forEach(chars => {
        if (chars.length === 1) {
            uniqueVoices.push(chars[0]);
        } else {
            sharedGroups.push({ primary: chars[0], shared: chars.slice(1) });
        }
    });

    console.log(`✅ UNIQUE VOICES (${uniqueVoices.length} characters - No changes needed):`);
    console.log('─'.repeat(60));
    uniqueVoices.forEach(c => {
        console.log(`   ${c.name} | ${c.voiceType || c.heritage || 'N/A'}`);
    });

    console.log(`\n⚠️  SHARED VOICE GROUPS (${sharedGroups.length} groups):`);
    console.log('─'.repeat(60));

    const problemShares: { name: string; seedId: string; issue: string; currentVoice: string }[] = [];
    const acceptableShares: { name: string; sharedWith: string; reason: string }[] = [];

    sharedGroups.forEach(group => {
        const primary = group.primary;
        console.log(`\n🔊 ${primary.name} (${primary.voiceType || primary.heritage})`);
        console.log(`   Voice ID: ${primary.fishAudioId.substring(0, 16)}...`);

        group.shared.forEach(c => {
            // Determine if this is a problematic share
            const primaryHeritage = (primary.heritage || primary.voiceType || '').toLowerCase();
            const sharedHeritage = (c.heritage || c.voiceType || '').toLowerCase();

            // Check for obvious mismatches
            const heritageMatch =
                primaryHeritage === sharedHeritage ||
                (primaryHeritage.includes('british') && sharedHeritage.includes('british')) ||
                (primaryHeritage.includes('japanese') && sharedHeritage.includes('japanese')) ||
                (primaryHeritage.includes('korean') && sharedHeritage.includes('korean')) ||
                (primaryHeritage.includes('french') && sharedHeritage.includes('french')) ||
                (primaryHeritage.includes('latin') && sharedHeritage.includes('latin')) ||
                (primaryHeritage.includes('mexican') && sharedHeritage.includes('mexican'));

            const genderMatch = !c.gender || !primary.gender || c.gender === primary.gender;

            if (!heritageMatch || !genderMatch) {
                problemShares.push({
                    name: c.name,
                    seedId: c.seedId,
                    issue: `${c.voiceType || c.heritage} using ${primary.voiceType || primary.heritage} voice`,
                    currentVoice: primary.name
                });
                console.log(`   ❌ ${c.name} - MISMATCH (${c.voiceType || c.heritage})`);
            } else {
                acceptableShares.push({
                    name: c.name,
                    sharedWith: primary.name,
                    reason: 'Same heritage/type'
                });
                console.log(`   ✓ ${c.name} - OK (${c.voiceType || c.heritage})`);
            }
        });
    });

    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              CHARACTERS NEEDING UNIQUE CLONES              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (problemShares.length === 0) {
        console.log('✅ No problematic shares detected!');
    } else {
        console.log('These characters need their own Fish Audio clones:\n');
        problemShares.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} (${p.seedId})`);
            console.log(`   Problem: ${p.issue}`);
            console.log(`   Using: ${p.currentVoice}'s voice`);
            console.log('');
        });
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ACCEPTABLE VOICE SHARES                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    acceptableShares.forEach((a, i) => {
        console.log(`${i + 1}. ${a.name} → ${a.sharedWith} ✓`);
    });

    console.log('\n\n📊 FINAL SUMMARY:');
    console.log('═'.repeat(50));
    console.log(`Total Characters:        35`);
    console.log(`Unique Voices:           ${uniqueVoices.length}`);
    console.log(`Acceptable Shares:       ${acceptableShares.length}`);
    console.log(`Problematic Shares:      ${problemShares.length}`);
    console.log('═'.repeat(50));
    console.log(`🔴 NEW CLONES NEEDED:    ${problemShares.length}`);
}

analyze().catch(console.error);
