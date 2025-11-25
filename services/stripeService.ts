
import { supabase } from './supabaseClient';

// Simulation of Server-Side Stripe interaction
// In a real app, this would be a Netlify Function or Node.js backend

export interface StripeSession {
  id: string;
  url: string;
}

export const createCheckoutSession = async (priceId: string, userEmail: string): Promise<StripeSession> => {
  console.log(`Simulating Stripe Checkout for ${userEmail} with plan ${priceId}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock session ID
  const sessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`;
  
  // In a real app, this URL would come from Stripe API
  // Here we redirect to our own Success page with the session_id param
  const successUrl = `${window.location.origin}/#/success?session_id=${sessionId}&plan=${priceId}`;
  
  return {
    id: sessionId,
    url: successUrl
  };
};

export const createCustomerPortal = async (): Promise<string> => {
    console.log("Simulating Customer Portal");
    await new Promise(resolve => setTimeout(resolve, 800));
    // In real life, redirects to billing.stripe.com
    // Here we just reload the profile page for demo
    return `${window.location.origin}/#/profile`;
};

export const verifySessionAndUpgrade = async (sessionId: string, planId: string) => {
    console.log(`Verifying session ${sessionId}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 1. Determine Credits based on Plan
    let credits = 225000; // Hobby
    let planName = 'Hobby';
    
    if (planId.includes('professional') || planId === 'price_pro') {
        credits = 1000000;
        planName = 'Professional';
    } else if (planId.includes('max') || planId === 'price_max') {
        credits = 2000000;
        planName = 'Max';
    }

    // 2. Update Local Storage (Simulation of DB update)
    const savedPrefs = localStorage.getItem('agentwrite_user_prefs');
    let prefs = savedPrefs ? JSON.parse(savedPrefs) : {};
    
    prefs.plan = planName;
    prefs.credits = credits;
    prefs.maxCredits = credits; // Reset monthly limit
    prefs.subscriptionStatus = 'active';
    prefs.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
    
    localStorage.setItem('agentwrite_user_prefs', JSON.stringify(prefs));
    
    return { success: true, plan: planName, credits };
};
