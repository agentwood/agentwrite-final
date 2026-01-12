/**
 * Reactivate Subscription API
 * Undoes cancellation if user changes their mind before period ends
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
                { error: 'No subscription found' },
                { status: 400 }
            );
        }

        // Undo the cancellation
        const subscription = await getStripe().subscriptions.update(
            user.subscriptionId,
            { cancel_at_period_end: false }
        );

        // Update database
        await db.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'active',
            },
        });

        console.log(`[Subscription] User ${userId} reactivated their subscription`);

        return NextResponse.json({
            success: true,
            status: subscription.status,
            message: 'Subscription reactivated successfully',
        });
    } catch (error: any) {
        console.error('[Reactivate Subscription] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to reactivate subscription' },
            { status: 500 }
        );
    }
}
