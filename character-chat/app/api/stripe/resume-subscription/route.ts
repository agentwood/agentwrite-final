/**
 * Resume Subscription API
 * Reactivates a subscription that was set to cancel at period end
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

// Lazy initialization
let stripe: Stripe | null = null;
function getStripe(): Stripe {
    if (!stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not set');
        }
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-12-15.clover' as any, // Fix TS error with specific version string casting
        });
    }
    return stripe;
}

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user's subscription
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                subscriptionId: true,
                subscriptionStatus: true,
            },
        });

        if (!user?.subscriptionId) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 400 }
            );
        }

        // Resume subscription by setting cancel_at_period_end to false
        await getStripe().subscriptions.update(
            user.subscriptionId,
            { cancel_at_period_end: false }
        );

        // Update database
        await db.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'active', // Reset to active
            },
        });

        console.log(`[Subscription] User ${userId} resumed subscription`);

        return NextResponse.json({
            success: true,
            message: 'Subscription successfully resumed',
        });
    } catch (error: any) {
        console.error('[Resume Subscription] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to resume subscription' },
            { status: 500 }
        );
    }
}
