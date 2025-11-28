import Stripe from 'stripe';
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // Should ideally be SERVICE_ROLE_KEY for backend updates
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
            // This mapping should ideally be in a config or database
            let creditsToAdd = 0;
            let planName = 'free';

            // Example mapping - REPLACE WITH REAL PRICE IDs
            if (priceId === process.env.STRIPE_PRICE_STARTER) {
                creditsToAdd = 150000;
                planName = 'starter';
            } else if (priceId === process.env.STRIPE_PRICE_PRO) {
                creditsToAdd = 750000;
                planName = 'pro';
            } else if (priceId === process.env.STRIPE_PRICE_UNLIMITED) {
                creditsToAdd = 2500000;
                planName = 'unlimited';
            } else if (priceId === process.env.STRIPE_PRICE_LTD) {
                creditsToAdd = 2500000; // Monthly equivalent or unlimited logic
                planName = 'lifetime';
            }

            // Update user in Supabase
            // Note: This requires a table structure that supports credits/plans
            // Assuming 'profiles' or 'users' table or similar logic

            // For now, we'll just log it as we might need to adjust the Supabase logic
            console.log(`Processing payment for user ${userId}: Plan ${planName}, Credits ${creditsToAdd}`);

            // TODO: Implement actual Supabase update
            // const { error } = await supabase
            //   .from('profiles')
            //   .update({ plan: planName, credits: creditsToAdd })
            //   .eq('id', userId);
        }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
