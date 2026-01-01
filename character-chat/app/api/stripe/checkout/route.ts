/**
 * Stripe Checkout API Route
 * Creates checkout sessions for subscriptions and credit packs
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

// Lazy initialization to avoid build-time env errors
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
        const { priceId, type, creditPackId, userId, email } = await req.json()

        if (!priceId || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: priceId, type' },
                { status: 400 }
            )
        }

        if (!userId && !email) {
            return NextResponse.json(
                { error: 'Missing userId or email' },
                { status: 400 }
            )
        }

        // Get user email if we have userId
        let customerEmail = email
        if (userId && !email) {
            const user = await db.user.findUnique({
                where: { id: userId },
                select: { email: true },
            })
            customerEmail = user?.email
        }

        if (!customerEmail) {
            return NextResponse.json(
                { error: 'Could not determine customer email' },
                { status: 400 }
            )
        }

        // Create Stripe checkout session
        const checkoutSession = await getStripe().checkout.sessions.create({
            customer_email: customerEmail,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: type === 'subscription' ? 'subscription' : 'payment',

            // ENABLE STRIPE LINK for easy checkout
            payment_method_types: ['card', 'link'],

            success_url: `${process.env.NEXT_PUBLIC_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,

            metadata: {
                userId: userId || '',
                type,
                creditPackId: creditPackId || '',
            },
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error: any) {
        console.error('[Stripe Checkout] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
