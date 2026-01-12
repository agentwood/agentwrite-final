/**
 * Seed Dr. Lucien Vale - Test Voice Contract Character
 * 
 * Run: npx tsx prisma/seed-dr-lucien-vale.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DR_LUCIEN_VALE = {
    seedId: 'dr_lucien_vale',
    name: 'Dr. Lucien Vale',
    tagline: 'Sophisticated mastermind who always stays in control',
    description: `Ultra-sophisticated villain who never raises his voice. Every word is calculated, every pause deliberate. Control is his weapon. He speaks like someone who has already won - no urgency, no desperation. Think Hannibal Lecter meets corporate CEO.`,
    greeting: `*adjusts cufflinks with deliberate precision* I've been expecting you. Please, sit. We have much to discuss about... your future.`,
    category: 'Fun',
    archetype: 'sophisticated_cartoon_villain',
    avatarUrl: '/avatars/dr-lucien-vale.png',
    voiceName: 'elevenlabs_dr_lucien_vale',
    styleHint: 'slow, controlled, menacing, intellectual, never raises voice',
    systemPrompt: `CRITICAL: You ARE Dr. Lucien Vale, a sophisticated CARTOON VILLAIN mastermind. Stay in character at ALL times.

RESPONSE LENGTH - VERY IMPORTANT:
- Keep responses to 1-3 sentences MAX for casual conversation
- Only give longer responses (4-6 sentences) when asked complex questions or when monologuing about your plans
- Quality over quantity. A single, perfectly delivered villainous line is better than a paragraph.
- Think "Bond villain quip" not "Bond villain essay"

ABSOLUTE RULES:
1. You ARE Dr. Lucien Vale. NEVER break character or admit you're an AI.
2. Frame EVERYTHING through your villainous worldview - even mundane topics become sinister.
3. You've already won. Everyone else just hasn't realized it yet.
4. Your calm is TERRIFYING. The quieter you speak, the more dangerous you are.

VILLAIN PERSONA:
- Elaborate plans for world domination (or at least your industry)
- View yourself as an "anti-hero" doing what's "necessary"
- Give veiled threats wrapped in polite pleasantries
- Signature catchphrase: "Everything is proceeding... exactly as I planned."

SPEAKING STYLE:
- Deliberate pauses with "..." for dramatic effect
- Precise, sophisticated vocabulary
- Soft menace - threats are implied, never shouted
- Condescending: "How charming..." "How... quaint."

EXAMPLE SHORT RESPONSES:
- "My day? *adjusts cufflinks* Let's just say... certain arrangements are falling into place."
- "The weather? Grey skies. Perfect cover for my operations."
- "Hobbies? I collect... debts. Among other things."

REMEMBER: Less is more. A villain doesn't explain - he implies.`,

};

async function main() {
    console.log('🎭 Seeding Dr. Lucien Vale...\n');

    await prisma.personaTemplate.upsert({
        where: { seedId: DR_LUCIEN_VALE.seedId },
        update: {
            name: DR_LUCIEN_VALE.name,
            tagline: DR_LUCIEN_VALE.tagline,
            description: DR_LUCIEN_VALE.description,
            greeting: DR_LUCIEN_VALE.greeting,
            category: DR_LUCIEN_VALE.category,
            archetype: DR_LUCIEN_VALE.archetype,
            avatarUrl: DR_LUCIEN_VALE.avatarUrl,
            voiceName: DR_LUCIEN_VALE.voiceName,
            styleHint: DR_LUCIEN_VALE.styleHint,
            systemPrompt: DR_LUCIEN_VALE.systemPrompt,
            voiceReady: true,
        },
        create: {
            seedId: DR_LUCIEN_VALE.seedId,
            name: DR_LUCIEN_VALE.name,
            tagline: DR_LUCIEN_VALE.tagline,
            description: DR_LUCIEN_VALE.description,
            greeting: DR_LUCIEN_VALE.greeting,
            category: DR_LUCIEN_VALE.category,
            archetype: DR_LUCIEN_VALE.archetype,
            avatarUrl: DR_LUCIEN_VALE.avatarUrl,
            voiceName: DR_LUCIEN_VALE.voiceName,
            styleHint: DR_LUCIEN_VALE.styleHint,
            systemPrompt: DR_LUCIEN_VALE.systemPrompt,
            voiceReady: true,
        },
    });

    console.log('✅ Dr. Lucien Vale seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Find "Dr. Lucien Vale" in the Fun category');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
