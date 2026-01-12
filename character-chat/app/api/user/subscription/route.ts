/**
 * User Subscription Status API
 * Returns subscription details from Stripe for billing display
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { getAuthHeaders } from '@/lib/auth';

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

export async function GET(req: NextRequest) {
    try {
        // Get user ID from auth headers or session
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({
                status: 'free',
                planId: 'free',
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
            });
        }

        // Get user from database
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                subscriptionTier: true,
                subscriptionStatus: true,
                subscriptionId: true,
                stripeCustomerId: true,
            },
        });

        if (!user || !user.subscriptionId) {
            return NextResponse.json({
                status: user?.subscriptionStatus || 'free',
                planId: user?.subscriptionTier || 'free',
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
            });
        }

        // Fetch subscription details from Stripe
        try {
            const subscription = await getStripe().subscriptions.retrieve(
                user.subscriptionId
            );

            const sub = subscription as any;
            return NextResponse.json({
                status: sub.status,
                planId: user.subscriptionTier || 'premium',
                currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
                currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
                cancelAt: sub.cancel_at
                    ? new Date(sub.cancel_at * 1000).toISOString()
                    : null,
            });
        } catch (stripeError) {
            console.error('[Subscription] Error fetching from Stripe:', stripeError);
            // Return cached data from database
            return NextResponse.json({
                status: user.subscriptionStatus || 'unknown',
                planId: user.subscriptionTier || 'free',
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
            });
        }
    } catch (error: any) {
        console.error('[Subscription] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription status' },
            { status: 500 }
        );
    }
}
