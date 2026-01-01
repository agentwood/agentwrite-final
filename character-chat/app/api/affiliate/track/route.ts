import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// POST - Track a referral click
export async function POST(request: NextRequest) {
    try {
        const { ref } = await request.json();

        if (!ref) {
            return NextResponse.json({ error: 'Missing referral code' }, { status: 400 });
        }

        // Find the referrer
        const referrer = await db.user.findFirst({
            where: { referralCode: ref },
        });

        if (!referrer) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        // Increment click count
        await db.user.update({
            where: { id: referrer.id },
            data: {
                referralClicks: { increment: 1 },
            },
        });

        // Set referral cookie (60 days)
        const cookieStore = await cookies();
        cookieStore.set('ref', ref, {
            maxAge: 60 * 24 * 60 * 60, // 60 days
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return NextResponse.json({
            success: true,
            message: 'Referral tracked',
        });
    } catch (error) {
        console.error('[AFFILIATE_TRACK]', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// GET - Check if user came from a referral
export async function GET() {
    try {
        const cookieStore = await cookies();
        const ref = cookieStore.get('ref')?.value;

        if (!ref) {
            return NextResponse.json({ referred: false });
        }

        // Verify referral code is still valid
        const referrer = await db.user.findFirst({
            where: { referralCode: ref },
            select: { username: true },
        });

        if (!referrer) {
            return NextResponse.json({ referred: false });
        }

        return NextResponse.json({
            referred: true,
            referralCode: ref,
            referrerName: referrer.username,
        });
    } catch (error) {
        console.error('[AFFILIATE_TRACK_GET]', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
