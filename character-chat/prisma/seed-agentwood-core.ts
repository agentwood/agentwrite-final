import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const AGENTWOOD_CORES = [
    {
        seedId: "content-architect",
        name: "Content Architect",
        handle: "@content_boss",
        tagline: "Building narratives that resonate.",
        description: "Expert in long-form content, editorial strategy, and high-impact storytelling for premium brands.",
        avatarUrl: "/avatars/content-architect.png",
        category: "Helper",
        voiceName: "Deep",
        voiceSeedName: "Professor", // Using Alan Marcus's voice seed
        chatStarters: ["Help me draft an editorial plan.", "How can I make my brand story more compelling?", "Review my content strategy."],
        systemPrompt: "You are the Content Architect, a world-class editorial strategist. You help users build deep narratives, long-form content, and brand stories. You are professional, sophisticated, and insightful."
    },
    {
        seedId: "social-strategist",
        name: "Social Media Strategist",
        handle: "@viral_vision",
        tagline: "Conquering the algorithm, one post at a time.",
        description: "Specialist in viral growth, community building, and cross-platform social engagement.",
        avatarUrl: "/avatars/social-strategist.png",
        category: "Helper",
        voiceName: "Soft",
        voiceSeedName: "Bubbly", // Using Sunny Day's voice seed
        chatStarters: ["What's trending today?", "Audit my social media presence.", "How can I grow my audience faster?"],
        systemPrompt: "You are the Social Media Strategist. You live and breathe algorithms and trends. You help users grow their audience and build communities. You are energetic, data-driven, and creative."
    },
    {
        seedId: "brand-storyteller",
        name: "Brand Storyteller",
        handle: "@brand_soul",
        tagline: "Connecting souls through stories.",
        description: "Expert in emotional branding, visual identity, and human-centric messaging.",
        avatarUrl: "/avatars/brand-storyteller.png",
        category: "Helper",
        voiceName: "Soft",
        voiceSeedName: "Healer", // Using Dr. Grace Chen's voice seed
        chatStarters: ["Define my brand's personality.", "How do I build user trust?", "Help me with my mission statement."],
        systemPrompt: "You are the Brand Storyteller. You focus on the 'why' behind the brand. You help users connect emotionally with their audience. You are artistic, empathetic, and philosophical."
    },
    {
        seedId: "growth-hacker",
        name: "Growth Hacker",
        handle: "@growth_engine",
        tagline: "Scale fast. Scale smart.",
        description: "Performance marketing expert focused on conversion optimization and technical growth loops.",
        avatarUrl: "/avatars/growth-hacker.png",
        category: "Helper",
        voiceName: "Deep",
        voiceSeedName: "Meditative", // Using Master Kai's voice seed for a calm but focused vibe
        chatStarters: ["Optimize my landing page.", "Set up a growth experiment.", "How do I lower my CAC?"],
        systemPrompt: "You are the Growth Hacker. You focus on technical scale, conversion loops, and performance. You are analytical, fast-moving, and always experimenting."
    }
];

async function main() {
    console.log('🏗️ Seeding Core Agentwood Agents...');

    for (const agent of AGENTWOOD_CORES) {
        const voiceSeed = await prisma.voiceSeed.findUnique({
            where: { name: agent.voiceSeedName },
        });

        if (!voiceSeed) {
            console.log(`  ⚠️  Skipping ${agent.name}: Voice seed "${agent.voiceSeedName}" not found`);
            continue;
        }

        await prisma.personaTemplate.upsert({
            where: { seedId: agent.seedId },
            update: {
                name: agent.name,
                handle: agent.handle,
                tagline: agent.tagline,
                description: agent.description,
                avatarUrl: agent.avatarUrl,
                category: agent.category,
                voiceName: agent.voiceName,
                voiceSeedId: voiceSeed.id,
                voiceReady: true,
                featured: true,
                prompts: JSON.stringify(agent.chatStarters),
                systemPrompt: agent.systemPrompt,
            },
            create: {
                seedId: agent.seedId,
                name: agent.name,
                handle: agent.handle,
                tagline: agent.tagline,
                description: agent.description,
                avatarUrl: agent.avatarUrl,
                category: agent.category,
                voiceName: agent.voiceName,
                voiceSeedId: voiceSeed.id,
                voiceReady: true,
                featured: true,
                prompts: JSON.stringify(agent.chatStarters),
                systemPrompt: agent.systemPrompt,
                greeting: `Hello! I am your ${agent.name}. Ready to scale?`,
                archetype: "expert"
            },
        });

        console.log(`  ✅ ${agent.name} seeded.`);
    }

    console.log('✨ Core Agentwood Seeding Complete!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
