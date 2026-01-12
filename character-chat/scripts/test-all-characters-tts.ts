import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface TestResult {
    name: string;
    gender: string;
    success: boolean;
    engine?: string;
    error?: string;
}

async function testCharacter(personaId: string, name: string, gender: string): Promise<TestResult> {
    const url = 'http://localhost:3000/api/tts';
    const payload = {
        text: `Hello, I am ${name}. Testing voice synthesis.`,
        personaId: personaId
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { name, gender, success: false, error: `HTTP ${response.status}: ${errorText.substring(0, 100)}` };
        }

        const data: any = await response.json();

        if (data.audio) {
            return { name, gender, success: true, engine: data.engine };
        } else {
            return { name, gender, success: false, error: 'No audio returned' };
        }
    } catch (error) {
        return { name, gender, success: false, error: (error as any).message };
    }
}

async function main() {
    console.log('🎙️ COMPREHENSIVE TTS TEST - ALL CHARACTERS\n');
    console.log('='.repeat(60));

    // Get a sample of characters (5 male, 5 female)
    const maleChars = await prisma.personaTemplate.findMany({
        where: { gender: 'M' },
        select: { id: true, name: true, gender: true },
        take: 5
    });

    const femaleChars = await prisma.personaTemplate.findMany({
        where: { gender: 'F' },
        select: { id: true, name: true, gender: true },
        take: 5
    });

    const testChars = [...maleChars, ...femaleChars];
    console.log(`\nTesting ${testChars.length} characters (5 male + 5 female sample)...\n`);

    const results: TestResult[] = [];

    for (const char of testChars) {
        process.stdout.write(`Testing ${char.name}... `);
        const result = await testCharacter(char.id, char.name, char.gender || 'unknown');
        results.push(result);

        if (result.success) {
            console.log(`✅ ${result.engine}`);
        } else {
            console.log(`❌ ${result.error}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESULTS SUMMARY:\n');

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    console.log(`✅ Success: ${successes.length}/${results.length}`);
    console.log(`❌ Failed: ${failures.length}/${results.length}`);

    if (failures.length > 0) {
        console.log('\n⚠️ Failed Characters:');
        failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    }

    // Engine distribution
    const engines: Record<string, number> = {};
    successes.forEach(s => {
        engines[s.engine!] = (engines[s.engine!] || 0) + 1;
    });

    console.log('\n🔊 Engine Distribution:');
    Object.entries(engines).forEach(([engine, count]) => {
        console.log(`  - ${engine}: ${count} characters`);
    });

    await prisma.$disconnect();
}

main().catch(console.error);
