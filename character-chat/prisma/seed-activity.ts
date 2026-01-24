import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding User Activity Data...');

    // 1. Create some dummy users
    const users = [];
    for (let i = 0; i < 20; i++) {
        const user = await prisma.user.create({
            data: {
                username: `user_${i}`,
                email: `user${i}@example.com`,
                creditsBalance: Math.floor(Math.random() * 500),
                subscriptionTier: Math.random() > 0.8 ? 'premium' : 'free',
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)), // Random date in last 30 days
            }
        });
        users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // 2. Get random characters
    const characters = await prisma.personaTemplate.findMany({ take: 10 });

    // 3. Create conversations and messages
    let totalMessages = 0;

    for (const user of users) {
        const numConvos = Math.floor(Math.random() * 5) + 1; // 1-5 conversations per user

        for (let c = 0; c < numConvos; c++) {
            const char = characters[Math.floor(Math.random() * characters.length)];

            const conversation = await prisma.conversation.create({
                data: {
                    userId: user.id,
                    personaId: char.id,
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)), // Last 7 days
                }
            });

            const numMsgs = Math.floor(Math.random() * 10) + 2; // 2-12 messages

            for (let m = 0; m < numMsgs; m++) {
                await prisma.message.createMany({
                    data: [
                        {
                            conversationId: conversation.id,
                            role: 'user',
                            text: 'Hello, how are you today?',
                            createdAt: new Date(conversation.createdAt.getTime() + m * 60000),
                        },
                        {
                            conversationId: conversation.id,
                            role: 'model',
                            text: "I'm doing great! Just living the simulation. How can I help?",
                            createdAt: new Date(conversation.createdAt.getTime() + m * 60000 + 5000),
                        }
                    ]
                });
                totalMessages += 2;
            }

            // Increment character stats
            await prisma.personaTemplate.update({
                where: { id: char.id },
                data: {
                    chatCount: { increment: 1 },
                    interactionCount: { increment: numMsgs }
                }
            });
        }
    }

    console.log(`✅ Created ${totalMessages} messages across active conversations.`);
    console.log('✨ Activity Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
