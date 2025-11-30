import Stripe from 'stripe';
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const handler: Handler = async (event) => {
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return { statusCode: 400, body: 'Missing signature or secret' };
    }

    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(event.body || '', sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const priceId = session.metadata?.priceId;

        if (userId) {
            // Determine plan and credits based on priceId
            let creditsToAdd = 0;
            let planName = 'starter';

            // Example mapping - REPLACE WITH REAL PRICE IDs
            const starterMonthly = process.env.VITE_STRIPE_PRICE_STARTER_MONTHLY;
            const starterYearly = process.env.VITE_STRIPE_PRICE_STARTER_YEARLY;
            const proMonthly = process.env.VITE_STRIPE_PRICE_PRO_MONTHLY;
            const proYearly = process.env.VITE_STRIPE_PRICE_PRO_YEARLY;
            const unlimitedMonthly = process.env.VITE_STRIPE_PRICE_UNLIMITED_MONTHLY;
            const unlimitedYearly = process.env.VITE_STRIPE_PRICE_UNLIMITED_YEARLY;
            const ltdPrice = process.env.VITE_STRIPE_PRICE_LTD;

            if (priceId === starterMonthly || priceId === starterYearly) {
                creditsToAdd = 15000;
                planName = 'starter';
            } else if (priceId === proMonthly || priceId === proYearly) {
                creditsToAdd = 75000;
                planName = 'pro';
            } else if (priceId === unlimitedMonthly || priceId === unlimitedYearly) {
                creditsToAdd = 999999999; // Unlimited
                planName = 'unlimited';
            } else if (priceId === ltdPrice) {
                creditsToAdd = 999999999; // Unlimited
                planName = 'lifetime';
            }

            console.log(`Processing payment for user ${userId}: Plan ${planName}, Credits ${creditsToAdd}`);

            // Update user_credits table
            // We use upsert to handle cases where the user might not have a record yet (though they should from signup)
            const { error } = await supabase
                .from('user_credits')
                .upsert({
                    user_id: userId,
                    plan: planName,
                    credits: creditsToAdd,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) {
                console.error('Supabase update error:', error);
                return { statusCode: 500, body: `Supabase error: ${error.message}` };
            }
        }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
