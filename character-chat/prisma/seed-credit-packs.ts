/**
 * Seed credit packs into database
 * Run with: npx tsx prisma/seed-credit-packs.ts
 */

import { db } from '../lib/db'
import { PRICING_CONFIG } from '../lib/credits'

async function main() {
    console.log('🌱 Seeding credit packs...')

    // Clear existing packs
    await db.creditPack.deleteMany({})

    // Create new packs
    const packs = PRICING_CONFIG.creditPacks.map((pack, index) => ({
        name: pack.name,
        credits: pack.credits,
        priceUsd: pack.price,
        stripePriceId: pack.stripePriceId || null,
        isActive: true,
        displayOrder: index,
    }))

    await db.creditPack.createMany({
        data: packs,
    })

    const created = await db.creditPack.findMany({
        orderBy: { displayOrder: 'asc' },
    })

    for (const pack of created) {
        console.log(`✅ ${pack.name}: ${pack.credits} credits for $${pack.priceUsd}`)
    }

    console.log(`✨ ${created.length} credit packs seeded successfully!`)
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
