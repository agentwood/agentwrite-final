import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/characters');

const STYLE_BLOCK = "detailed digital illustration, painterly brush strokes, semi-realistic portrait, rich atmospheric background, cinematic composition, warm and cool color contrast, dramatic lighting with rim lights and soft fill, detailed facial features, expressive eyes, textured clothing, environmental storytelling, moody atmosphere, vibrant color palette, professional concept art quality, artstation trending, 4k ultra detailed";

const SKIP_NAMES = [
    'Chippy the Squirrel',
    'Detective Mittens',
    'Sir Prance-a-Lot',
    'Alien Zorg',
    'Captain Bucky',
    'Luna the Stargazer',
    'Zombie Pete',
    'Disco Dave'
];

async function generateImage(prompt: string, description: string, id: string) {
    const finalPrompt = `High-end semi-realistic digital illustration, cinematic visual novel art style. A detailed character portrait. Character: ${prompt}. Details: ${description}. ${STYLE_BLOCK}.`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1000&height=1000&nologo=true&seed=${id}&model=flux`;

    console.log(`  Fetching: ${url.substring(0, 100)}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    const filePath = path.join(OUTPUT_DIR, `${id}.png`);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return `/characters/${id}.png`;
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const personas = await prisma.personaTemplate.findMany();
    console.log(`Processing ${personas.length} personas...`);

    for (const p of personas) {
        if (SKIP_NAMES.includes(p.name)) {
            console.log(`⏭️ Skipping ${p.name} (marked as 'no face' or style face)`);
            continue;
        }

        const isDefault = p.avatarUrl?.includes('dicebear.com') || p.avatarUrl?.includes('unsplash.com') || !p.avatarUrl;
        const alreadyCustom = p.avatarUrl?.startsWith('/characters/');

        if (isDefault && !alreadyCustom) {
            console.log(`🎨 Updating ${p.name}...`);
            try {
                const prompt = `${p.name}, ${p.tagline || ''}`;
                const description = p.description || '';
                const newPath = await generateImage(prompt, description, p.id);

                await prisma.personaTemplate.update({
                    where: { id: p.id },
                    data: { avatarUrl: newPath }
                });
                console.log(`✅ Updated ${p.name} successfully.`);
            } catch (e) {
                console.error(`❌ Failed ${p.name}:`, e);
            }
            // Small Sleep to avoid hammering
            await new Promise(r => setTimeout(r, 1000));
        } else {
            console.log(`✅ ${p.name} already has a custom avatar.`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
