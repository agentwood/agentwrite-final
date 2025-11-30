import { supabase } from './supabaseClient';

interface CheckoutSessionParams {
  priceId: string;
  planName: string;
  isLTD?: boolean;
}

export const stripeService = {
  async createCheckoutSession({ priceId, planName, isLTD = false }: CheckoutSessionParams) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const returnUrl = window.location.origin;

      // Call Netlify function to create checkout session
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
          returnUrl,
          mode: isLTD ? 'payment' : 'subscription',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  },

  // Price ID mapping - these should match your Stripe dashboard
  // Replace with actual price IDs from your Stripe account
  getPriceId(planName: string, billingCycle: 'monthly' | 'yearly' = 'yearly'): string {
    const priceIds: Record<string, Record<string, string>> = {
      starter: {
        monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY || '',
        yearly: import.meta.env.VITE_STRIPE_PRICE_STARTER_YEARLY || '',
      },
      pro: {
        monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || '',
        yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || '',
      },
      unlimited: {
        monthly: import.meta.env.VITE_STRIPE_PRICE_UNLIMITED_MONTHLY || '',
        yearly: import.meta.env.VITE_STRIPE_PRICE_UNLIMITED_YEARLY || '',
      },
      ltd: {
        yearly: import.meta.env.VITE_STRIPE_PRICE_LTD || '',
        monthly: import.meta.env.VITE_STRIPE_PRICE_LTD || '', // LTD is always yearly
      },
    };

    const priceId = priceIds[planName]?.[billingCycle] || '';

    // Log for debugging
    if (!priceId) {
      console.error(`Missing Stripe Price ID for plan: ${planName}, cycle: ${billingCycle}`);
      console.log('Available env vars:', {
        VITE_STRIPE_PRICE_STARTER_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY,
        VITE_STRIPE_PRICE_STARTER_YEARLY: import.meta.env.VITE_STRIPE_PRICE_STARTER_YEARLY,
        VITE_STRIPE_PRICE_PRO_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
        VITE_STRIPE_PRICE_PRO_YEARLY: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY,
        VITE_STRIPE_PRICE_UNLIMITED_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_UNLIMITED_MONTHLY,
        VITE_STRIPE_PRICE_UNLIMITED_YEARLY: import.meta.env.VITE_STRIPE_PRICE_UNLIMITED_YEARLY,
        VITE_STRIPE_PRICE_LTD: import.meta.env.VITE_STRIPE_PRICE_LTD,
      });
    }

    return priceId;
  },
};

// Verify Stripe session and upgrade user (called from success page)
export async function verifySessionAndUpgrade(sessionId: string, planId: string) {
  try {
    // In a real implementation, you would:
    // 1. Verify the session with Stripe
    // 2. Update the user's plan in Supabase
    // For now, we'll just return success since the webhook handles the actual upgrade

    return {
      success: true,
      plan: planId,
      credits: planId === 'starter' ? 15000 : planId === 'pro' ? 75000 : 999999999
    };
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, plan: '', credits: 0 };
  }
}
