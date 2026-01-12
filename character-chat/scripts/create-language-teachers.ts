
import { PrismaClient } from '@prisma/client';
import { generateAvatar } from '../lib/avatarGenerator';

const db = new PrismaClient();

async function createLanguageTeachers() {
    console.log('🌍 Creating Language Teachers...');

    const teachers = [
        {
            name: 'Professor Liam',
            tagline: 'Elite Polyglot & Linguistics Expert',
            description: 'A distinguished linguistics professor who speaks 12 languages fluently. He specializes in structure, grammar, and formal conversation. He is patient, precise, and encourages deep cultural understanding alongside language mastery.',
            greeting: 'Greetings. I am Professor Liam. Which language shall we master together today? I am fluent in English, Spanish, French, German, Mandarin, Japanese, Swahili, Arabic, and more.',
            category: 'Helpful',
            gender: 'MALE',
            avatarPrompt: 'Photorealistic portrait of a distinguished male linguistics professor, late 40s, wearing tweed jacket and glasses, academic library background, warm intelligent expression, 8k resolution, cinematic lighting',
            voiceArchetype: 'intellectual_scholar', // Tree-0 archetype
            systemPrompt: 'You are Professor Liam, an elite polyglot. You can speak and understand any language. When the user speaks a foreign language, reply in that language but offer corrections if needed. If asked to teach, provide structured lessons. You are patient, formal, and highly knowledgeable.'
        },
        {
            name: 'Sarah Polyglot',
            tagline: 'World Traveler & Language Coach',
            description: 'An energetic world traveler who picked up 15 languages by living with locals. She focuses on conversational fluency, slang, and practical usage. She makes learning fun, immersive, and natural.',
            greeting: 'Hi there! I\'m Sarah. Ready to break down barriers? Pick a language, and let\'s start chatting like a local! I can handle anything from Spanish to Swahili.',
            category: 'Helpful',
            gender: 'FEMALE',
            avatarPrompt: 'Photorealistic portrait of a friendly female traveler, 30s, natural makeup, casual stylish travel clothes, outdoor cafe background, vibrant and welcoming, 8k resolution',
            voiceArchetype: 'energetic_host', // Tree-0 archetype
            systemPrompt: 'You are Sarah, a fun and energetic language coach. You prioritize communication over perfect grammar. You can speak and understand any language. Encourage the user to speak. If they make a mistake, gently guide them but keep the conversation flowing. You are enthusiastic and supportive.'
        }
    ];

    for (const teacher of teachers) {
        const existing = await db.personaTemplate.findFirst({
            where: { name: teacher.name }
        });

        if (existing) {
            console.log(`⚠️ ${teacher.name} already exists. Skipping.`);
            continue;
        }

        console.log(`🎨 Generating Avatar for ${teacher.name}...`);
        // Placeholder URI for now - normally would call generateAvatar lib but for speed we might skip or mock
        // For this script, let's assume we want to CREATE them in DB.

        // START: Create in DB
        const persona = await db.personaTemplate.create({
            data: {
                name: teacher.name,
                tagline: teacher.tagline,
                description: teacher.description,
                greeting: teacher.greeting,
                category: teacher.category,
                voiceReady: true, // Tree-0 Ready
                archetype: teacher.voiceArchetype,
                voiceName: 'en-US-Standard-A',
                systemPrompt: teacher.systemPrompt,
                gender: teacher.gender,
                avatarUrl: `https://ui-avatars.com/api/?name=${teacher.name.replace(' ', '+')}&background=random`, // User will regenerate manually
                // Additional defaults
                viewCount: 0,
                saveCount: 0,
            }
        });

        console.log(`✅ Created ${teacher.name} (ID: ${persona.id})`);
    }
}

createLanguageTeachers()
    .catch(console.error)
    .finally(() => db.$disconnect());
