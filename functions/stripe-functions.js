/**
 * Cloud Functions for Stripe Integration - MVP Multi-Brand (Gen2)
 *
 * Handles:
 * - Checkout session creation
 * - Webhook processing (payment confirmation)
 * - Brand activation
 * - Email sending
 */

const { onCall, HttpsError, onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Stripe (lazy initialization to avoid errors during deployment)
let stripeInstance;
const getStripe = () => {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (apiKey) {
      stripeInstance = require('stripe')(apiKey);
    }
  }
  return stripeInstance;
};

/**
 * Helper: Generate slug from brand name
 */
function generateSlug(brandName) {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Helper: Generate secure temporary password
 */
function generateSecurePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  // Ensure at least one uppercase, one number, one special char
  return password + 'A1!';
}

/**
 * Helper: Generate random string for IDs
 */
function generateRandomString(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

/**
 * Helper: Send welcome email (placeholder - integrate SendGrid/Resend)
 */
async function sendWelcomeEmail(email, password, subdomain, brandName) {
  // TODO: Integrate with SendGrid or Resend
  // For MVP, just log the credentials
  console.log('📧 Welcome Email:');
  console.log('  To:', email);
  console.log('  Brand:', brandName);
  console.log('  Dashboard:', `https://${subdomain}/dashboard`);
  console.log('  Password:', password);
  console.log('  ---');
  console.log('  ⚠️  TODO: Integrate real email service (SendGrid/Resend)');

  // Placeholder: Return success
  return Promise.resolve();
}

/**
 * 1. CREATE CHECKOUT SESSION
 *
 * Callable function from frontend to create Stripe checkout
 */
exports.createCheckoutSession = onCall(async (request) => {
  const { email, brandName } = request.data;

  console.log('🛒 Creating checkout session for:', email, brandName);

  // Validate inputs
  if (!email || !brandName) {
    throw new HttpsError('invalid-argument', 'Email and brand name are required');
  }

  try {
    // Generate slug and check uniqueness
    const slug = generateSlug(brandName);
    const db = admin.firestore();

    const existingBrand = await db.collection('brands').where('slug', '==', slug).limit(1).get();

    if (!existingBrand.empty) {
      throw new HttpsError(
        'already-exists',
        'Brand name already taken. Please choose another name.'
      );
    }

    // Create brand in pending status
    const brandId = `brand-${Date.now()}-${generateRandomString(8)}`;
    const subdomain = `${slug}.yourdomain.com`; // TODO: Replace with actual domain

    await db
      .collection('brands')
      .doc(brandId)
      .set({
        name: brandName,
        slug,
        subdomain,
        status: 'pending',
        ownerEmail: email,
        branding: {
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
          backgroundColor: '#ffffff',
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log('✅ Brand created in pending:', brandId);

    // Get Stripe Price ID from environment
    const stripePriceId = process.env.STRIPE_PRICE_ID || functions.config().stripe?.price_id;

    if (!stripePriceId) {
      throw new functions.https.HttpsError('failed-precondition', 'Stripe Price ID not configured');
    }

    // Create Stripe checkout session
    const stripe = getStripe();
    if (!stripe) {
      throw new HttpsError('failed-precondition', 'Stripe not configured');
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://yourdomain.com/setup-complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://yourdomain.com/pricing`,
      customer_email: email,
      metadata: {
        brandId,
        brandName,
        email,
        subdomain,
      },
    });

    console.log('✅ Stripe session created:', session.id);

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      brandId,
    };
  } catch (error) {
    console.error('❌ Error creating checkout:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * 2. HANDLE STRIPE WEBHOOK
 *
 * Processes Stripe events (payment confirmation, subscription updates)
 */
exports.handleStripeWebhook = onRequest(
  {
    timeoutSeconds: 60,
    memory: '512MiB',
    cors: true,
  },
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('❌ Webhook secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
      const stripe = getStripe();
      if (!stripe) {
        console.error('❌ Stripe not configured');
        return res.status(500).send('Stripe not configured');
      }
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
      console.log('📨 Stripe webhook received:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;

        default:
          console.log(`⏭️  Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      res.status(500).send('Webhook processing failed');
    }
  }
);

/**
 * 3. HANDLE CHECKOUT COMPLETED
 *
 * Activates brand after successful payment
 */
async function handleCheckoutCompleted(session) {
  console.log('🎉 Checkout completed for session:', session.id);

  const { brandId, email, brandName, subdomain } = session.metadata;
  const customerId = session.customer;

  if (!brandId) {
    console.error('❌ No brandId in session metadata');
    return;
  }

  try {
    const db = admin.firestore();

    // Generate temporary password
    const tempPassword = generateSecurePassword();

    // Create Firebase Auth user
    console.log('👤 Creating auth user for:', email);
    const userRecord = await admin.auth().createUser({
      email,
      password: tempPassword,
      displayName: brandName,
      emailVerified: false,
    });

    console.log('✅ Auth user created:', userRecord.uid);

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    console.log(
      '🔍 Debug subscription.current_period_end:',
      subscription.current_period_end,
      typeof subscription.current_period_end
    );

    // Calculate period end date
    let periodEndTimestamp;
    if (subscription.current_period_end) {
      // Stripe timestamps are in seconds, convert to milliseconds
      const periodEndMs = subscription.current_period_end * 1000;
      periodEndTimestamp = admin.firestore.Timestamp.fromMillis(periodEndMs);
      console.log('✅ Calculated periodEndTimestamp:', periodEndTimestamp);
    }

    // Update brand to active
    await db
      .collection('brands')
      .doc(brandId)
      .update({
        status: 'active',
        subscription: {
          stripeCustomerId: customerId,
          status: 'active',
          currentPeriodEnd: periodEndTimestamp || admin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log('✅ Brand activated:', brandId);

    // Create superuser document
    await db.collection('superusers').doc(userRecord.uid).set({
      email,
      brandId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Superuser created:', userRecord.uid);

    // Create default settings
    await db
      .collection('brands')
      .doc(brandId)
      .collection('settings')
      .doc('site')
      .set({
        appName: brandName,
        logoUrl: null,
        footerText: `© ${new Date().getFullYear()} ${brandName}`,
        navLinks: [],
      });

    console.log('✅ Default settings created');

    // Send welcome email with credentials
    await sendWelcomeEmail(email, tempPassword, subdomain, brandName);

    console.log('🎉 Brand activation complete!');
  } catch (error) {
    console.error('❌ Error activating brand:', error);
    throw error;
  }
}

/**
 * 4. HANDLE SUBSCRIPTION UPDATED
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  const db = admin.firestore();

  try {
    // Find brand by Stripe customer ID
    const brandsSnapshot = await db
      .collection('brands')
      .where('subscription.stripeCustomerId', '==', subscription.customer)
      .limit(1)
      .get();

    if (brandsSnapshot.empty) {
      console.log('⚠️  Brand not found for customer:', subscription.customer);
      return;
    }

    const brandDoc = brandsSnapshot.docs[0];

    // Update subscription status
    await brandDoc.ref.update({
      'subscription.status': subscription.status,
      'subscription.currentPeriodEnd': admin.firestore.Timestamp.fromDate(
        new Date(subscription.current_period_end * 1000)
      ),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Subscription updated for brand:', brandDoc.id);
  } catch (error) {
    console.error('❌ Error updating subscription:', error);
  }
}

/**
 * 5. HANDLE SUBSCRIPTION DELETED (Canceled)
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription canceled:', subscription.id);

  const db = admin.firestore();

  try {
    // Find brand by Stripe customer ID
    const brandsSnapshot = await db
      .collection('brands')
      .where('subscription.stripeCustomerId', '==', subscription.customer)
      .limit(1)
      .get();

    if (brandsSnapshot.empty) {
      console.log('⚠️  Brand not found for customer:', subscription.customer);
      return;
    }

    const brandDoc = brandsSnapshot.docs[0];

    // Update brand status to suspended
    await brandDoc.ref.update({
      status: 'suspended',
      'subscription.status': 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Brand suspended due to cancelation:', brandDoc.id);

    // TODO: Send cancellation email
  } catch (error) {
    console.error('❌ Error handling subscription deletion:', error);
  }
}
