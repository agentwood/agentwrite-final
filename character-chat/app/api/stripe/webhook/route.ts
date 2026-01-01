/**
 * Stripe Webhook Handler
 * Handles subscription and payment events from Stripe
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { addCredits } from '@/lib/credits'

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
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
        } else {
            // Parse without verification (development mode)
            event = JSON.parse(body) as Stripe.Event
            console.warn('[Webhook] Processing event without signature verification')
        }
    } catch (err: any) {
        console.error(`[Webhook] Signature verification failed:`, err.message)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    console.log(`[Webhook] Received event: ${event.type}`)

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const { userId, type, creditPackId } = session.metadata!

                if (!userId) {
                    console.error('[Webhook] No userId in metadata')
                    break
                }

                if (type === 'subscription') {
                    // Handle subscription purchase
                    await db.user.update({
                        where: { id: userId },
                        data: {
                            subscriptionTier: 'premium',
                            subscriptionId: session.subscription as string,
                            subscriptionStatus: 'active',
                            stripeCustomerId: session.customer as string,
                        },
                    })

                    console.log(`[Webhook] ✅ Premium subscription activated for user ${userId}`)
                } else if (type === 'credits' && creditPackId) {
                    // Handle credit pack purchase
                    const creditPack = await db.creditPack.findUnique({
                        where: { id: creditPackId },
                    })

                    if (!creditPack) {
                        console.error(`[Webhook] Credit pack not found: ${creditPackId}`)
                        break
                    }

                    const user = await db.user.findUnique({
                        where: { id: userId },
                        select: { subscriptionTier: true },
                    })

                    // Apply 50% bonus credits for premium users
                    const creditsToAdd =
                        user?.subscriptionTier === 'premium'
                            ? Math.round(creditPack.credits * 1.5)
                            : creditPack.credits

                    // Add credits and create purchase record
                    await addCredits(
                        userId,
                        creditsToAdd,
                        'purchase',
                        `Purchased ${creditPack.name} pack`,
                        {
                            creditPackId,
                            originalCredits: creditPack.credits,
                            bonusApplied: user?.subscriptionTier === 'premium',
                            stripeSessionId: session.id,
                        }
                    )

                    await db.creditPurchase.create({
                        data: {
                            userId,
                            creditPackId,
                            creditsAdded: creditsToAdd,
                            amountPaid: creditPack.priceUsd,
                            stripeSessionId: session.id,
                            status: 'completed',
                        },
                    })

                    console.log(
                        `[Webhook] ✅ Added ${creditsToAdd} credits to user ${userId} (${creditPack.name})`
                    )
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription

                await db.user.updateMany({
                    where: { subscriptionId: subscription.id },
                    data: {
                        subscriptionStatus: subscription.status,
                    },
                })

                console.log(`[Webhook] ✅ Subscription status updated: ${subscription.status}`)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription

                await db.user.updateMany({
                    where: { subscriptionId: subscription.id },
                    data: {
                        subscriptionTier: 'free',
                        subscriptionStatus: 'canceled',
                    },
                })

                console.log(`[Webhook] ✅ Subscription canceled`)
                break
            }

            default:
                console.log(`[Webhook] Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error(`[Webhook] Error processing event:`, error)
        return NextResponse.json(
            { error: `Webhook processing failed: ${error.message}` },
            { status: 500 }
        )
    }
}
