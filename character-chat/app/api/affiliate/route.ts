import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate a unique referral code
function generateReferralCode(username: string): string {
    const base = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const random = Math.random().toString(36).substring(2, 6);
    return `${base}${random}`;
}

// GET - Get affiliate stats for a user (by userId query param for now)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                referralCode: true,
                referralCount: true,
                referralClicks: true,
                affiliateEarnings: true,
                unpaidEarnings: true,
                stripeConnectId: true,
                username: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate referral code if not exists
        let referralCode = user.referralCode;
        if (!referralCode) {
            referralCode = generateReferralCode(user.username || userId);
            await db.user.update({
                where: { id: userId },
                data: { referralCode },
            });
        }

        // Calculate conversion rate
        const conversionRate = user.referralClicks > 0
            ? (user.referralCount / user.referralClicks) * 100
            : 0;

        // Get recent payouts
        const payouts = await db.payout.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Get referral purchases
        const referralPurchases = await db.referralPurchase.findMany({
            where: { referrerId: userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        return NextResponse.json({
            stats: {
                totalClicks: user.referralClicks,
                referrals: user.referralCount,
                conversionRate: conversionRate.toFixed(1),
                totalEarnings: user.affiliateEarnings,
                unpaidEarnings: user.unpaidEarnings,
                referralLink: `https://agentwood.ai/?ref=${referralCode}`,
                stripeConnected: !!user.stripeConnectId,
            },
            payouts: payouts.map(p => ({
                id: p.id,
                date: p.createdAt.toISOString(),
                amount: p.amount,
                status: p.status === 'paid' ? 'Paid' : p.status === 'processing' ? 'Processing' : 'Held (90 Days)',
                period: p.period,
            })),
            referralPurchases: referralPurchases.map(rp => ({
                id: rp.id,
                amount: rp.purchaseAmount,
                commission: rp.commission,
                status: rp.status,
                date: rp.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error('[AFFILIATE_GET]', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// POST - Generate or regenerate referral code
export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: { username: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate new referral code
        const referralCode = generateReferralCode(user.username || userId);

        await db.user.update({
            where: { id: userId },
            data: { referralCode },
        });

        return NextResponse.json({
            referralCode,
            referralLink: `https://agentwood.ai/?ref=${referralCode}`,
        });
    } catch (error) {
        console.error('[AFFILIATE_POST]', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
