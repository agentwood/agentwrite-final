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
        throw new Error('Failed to create checkout session');
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
        monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
        yearly: import.meta.env.VITE_STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
      },
      pro: {
        monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
        yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
      },
      unlimited: {
        monthly: import.meta.env.VITE_STRIPE_PRICE_UNLIMITED_MONTHLY || 'price_unlimited_monthly',
        yearly: import.meta.env.VITE_STRIPE_PRICE_UNLIMITED_YEARLY || 'price_unlimited_yearly',
      },
      ltd: {
        yearly: import.meta.env.VITE_STRIPE_PRICE_LTD || 'price_ltd',
        monthly: import.meta.env.VITE_STRIPE_PRICE_LTD || 'price_ltd', // LTD is always yearly
      },
    };

    return priceIds[planName]?.[billingCycle] || '';
  },
};
