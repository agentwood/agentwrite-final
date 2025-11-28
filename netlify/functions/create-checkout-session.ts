import Stripe from 'stripe';
import { Handler } from '@netlify/functions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { priceId, userId, userEmail, returnUrl, mode } = JSON.parse(event.body || '{}');

        if (!priceId || !userId) {
            return { statusCode: 400, body: 'Missing required parameters' };
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode || 'subscription', // 'subscription' or 'payment' for one-time
            success_url: `${returnUrl}/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl}/pricing`,
            customer_email: userEmail,
            client_reference_id: userId,
            metadata: {
                userId,
                priceId,
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ sessionId: session.id, url: session.url }),
        };
    } catch (error: any) {
        console.error('Stripe error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
