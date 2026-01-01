import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to avoid build-time env errors
let stripe: Stripe | null = null;
function getStripe(): Stripe {
    if (!stripe) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-12-15.clover',
        });
    }
    return stripe;
}

export async function POST(request: NextRequest) {
    try {
        const { priceId, planId, mode = 'subscription' } = await request.json();

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price ID is required' },
                { status: 400 }
            );
        }

        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY not configured');
            return NextResponse.json(
                { error: 'Payment system not configured' },
                { status: 500 }
            );
        }

        // Get base URL for redirects
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Create Stripe checkout session
        const session = await getStripe().checkout.sessions.create({
            mode: mode as 'payment' | 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
            cancel_url: `${baseUrl}/pricing?canceled=true`,
            metadata: {
                planId,
            },
            // Allow promotion codes
            allow_promotion_codes: true,
            // Billing address collection
            billing_address_collection: 'required',
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);

        if (error instanceof Stripe.errors.StripeError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode || 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
