
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env file (defaults to current dir)
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is missing in .env');
    process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover' as any, // Using the version from code, ignoring typical TS error for precise version string
});

async function testStripeConfig() {
    console.log('🔍 Testing Stripe Configuration...');
    console.log(`Key loaded: ${STRIPE_SECRET_KEY!.slice(0, 8)}...`);

    try {
        // 1. List Products (Basic auth check)
        const products = await stripe.products.list({ limit: 1 });
        console.log('✅ Connection Successful! Found', products.data.length, 'products.');

        // 2. Check for Specific Price IDs (if in env)
        const priceIds = [
            process.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
            process.env.VITE_STRIPE_PRICE_STARTER_MONTHLY
        ].filter(Boolean);

        if (priceIds.length > 0) {
            console.log('\n🔍 Verifying Payment Plans in Stripe...');
            for (const id of priceIds) {
                try {
                    const price = await stripe.prices.retrieve(id as string);
                    console.log(`   ✅ Price Found: ${id} (${price.unit_amount ? price.unit_amount / 100 : 0} ${price.currency.toUpperCase()})`);
                } catch (err: any) {
                    console.error(`   ❌ Price ID Invalid: ${id} - ${err.message}`);
                }
            }
        } else {
            console.log('\n⚠️ No Price IDs found in .env to verify.');
        }

        console.log('\n✅ Stripe configuration looks good for local testing.');

    } catch (error: any) {
        console.error('\n❌ Stripe Connection Failed:', error.message);
    }
}

testStripeConfig();
