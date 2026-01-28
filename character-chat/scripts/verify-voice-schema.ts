import { db } from '../lib/db';

async function verifySchema() {
    console.log('🔍 Verifying Voice-to-Earn Schema...');

    // 1. Check for User
    const user = await db.user.findFirst();
    if (!user) {
        console.log('❌ No users found. Cannot test VoiceContribution.');
        return;
    }
    console.log(`✅ Found User: ${user.id} (${user.email || 'No Email'})`);

    // 2. Create Voice Contribution
    const voice = await db.voiceContribution.create({
        data: {
            contributorId: user.id,
            audioFilePath: 's3://test-bucket/test.wav',
            audioDurationSeconds: 60,
            audioFormat: 'wav',
            status: 'processing',
            displayName: 'Test Voice 001'
        }
    });
    console.log(`✅ Created VoiceContribution: ${voice.id}`);

    // 3. Create Settlement
    const settlement = await db.voiceSettlement.create({
        data: {
            contributorId: user.id,
            voiceContributionId: voice.id,
            settlementPeriod: '2026-Test',
            periodStart: new Date(),
            periodEnd: new Date(),
            totalAwsTokens: 100,
            totalCashUsd: 1.00
        }
    });
    console.log(`✅ Created VoiceSettlement: ${settlement.id}`);

    // 4. Cleanup
    await db.voiceSettlement.delete({ where: { id: settlement.id } });
    await db.voiceContribution.delete({ where: { id: voice.id } });
    console.log('✅ Cleanup Complete');

    console.log('🎉 Schema Verification SUCCESS');
}

verifySchema()
    .catch(console.error)
    .finally(() => db.$disconnect());
