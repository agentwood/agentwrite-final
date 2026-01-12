/**
 * Cancel Subscription API
 * Cancels user's subscription at end of billing period
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
            apiVersion: '2025-12-15.clover',
        });
    }
    return stripe;
}

export async function POST(req: NextRequest) {
    try {
        const { reason, customReason } = await req.json();
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

        // Cancel at end of period (not immediately)
        const subscription = await getStripe().subscriptions.update(
            user.subscriptionId,
            { cancel_at_period_end: true }
        );

        // Update database
        await db.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'canceling',
            },
        });

        // Log cancellation reason for analytics
        console.log(`[Subscription] User ${userId} cancelled. Reason: ${reason}${customReason ? ` - ${customReason}` : ''}`);

        return NextResponse.json({
            success: true,
            cancelAt: new Date((subscription as any).current_period_end * 1000).toISOString(),
            message: 'Subscription will be cancelled at end of billing period',
        });
    } catch (error: any) {
        console.error('[Cancel Subscription] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
