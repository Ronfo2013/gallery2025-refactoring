/**
 * Stripe Service - Frontend Integration
 *
 * Handles Stripe operations from the frontend:
 * - Create checkout session
 * - Redirect to Stripe checkout
 * - Customer portal (for subscription management)
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';

/**
 * Create checkout session via Cloud Function
 */
export const createCheckoutSession = async (
  email: string,
  brandName: string
): Promise<{ sessionId: string; checkoutUrl: string; brandId: string }> => {
  try {
    console.log('🛒 Creating checkout session for:', email, brandName);

    const createSession = httpsCallable<
      { email: string; brandName: string },
      { sessionId: string; checkoutUrl: string; brandId: string }
    >(functions, 'createCheckoutSession');

    const result = await createSession({ email, brandName });

    console.log('✅ Checkout session created:', result.data.sessionId);

    return result.data;
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);

    // Handle Firebase function errors
    if (error.code === 'already-exists') {
      throw new Error('Brand name already taken. Please choose another name.');
    } else if (error.code === 'invalid-argument') {
      throw new Error('Invalid input. Please check your details.');
    } else {
      throw new Error('Failed to create checkout session. Please try again.');
    }
  }
};

/**
 * Redirect to Stripe checkout
 * Note: stripe.redirectToCheckout() is deprecated, we now use direct URL redirect
 */
export const redirectToStripeCheckout = async (checkoutUrl: string): Promise<void> => {
  try {
    console.log('🔄 Redirecting to Stripe checkout...');
    console.log('Checkout URL:', checkoutUrl);

    // Direct redirect to Stripe checkout URL
    window.location.href = checkoutUrl;
  } catch (error) {
    console.error('❌ Error redirecting to checkout:', error);
    throw error;
  }
};

/**
 * Combined function: Create and redirect to checkout
 */
export const initiateCheckout = async (email: string, brandName: string): Promise<void> => {
  try {
    const { checkoutUrl } = await createCheckoutSession(email, brandName);
    await redirectToStripeCheckout(checkoutUrl);
  } catch (error) {
    console.error('❌ Error initiating checkout:', error);
    throw error;
  }
};

/**
 * Open Stripe Customer Portal for subscription management
 * (Future: for MVP not needed, but useful post-MVP)
 */
export const openCustomerPortal = async (stripeCustomerId: string): Promise<void> => {
  try {
    console.log('🔄 Opening customer portal...');

    const createPortalSession = httpsCallable<{ stripeCustomerId: string }, { url: string }>(
      functions,
      'createCustomerPortalSession'
    );

    const result = await createPortalSession({ stripeCustomerId });

    // Redirect to Stripe portal
    window.location.href = result.data.url;
  } catch (error) {
    console.error('❌ Error opening customer portal:', error);
    throw error;
  }
};

/**
 * Validate checkout session (after redirect back)
 */
export const validateCheckoutSession = async (sessionId: string): Promise<boolean> => {
  try {
    // This would call a Cloud Function to check if payment was successful
    // For MVP, we'll just return true and rely on webhook
    console.log('✅ Checkout session:', sessionId);
    return true;
  } catch (error) {
    console.error('❌ Error validating session:', error);
    return false;
  }
};
