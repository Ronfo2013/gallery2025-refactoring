# Stripe Setup Guide - MVP

## Step 1: Crea Account Stripe

1. Vai su https://dashboard.stripe.com/register
2. Crea account (o login se esiste già)
3. Verifica email

## Step 2: Crea Product e Price

1. Vai su **Products** nel dashboard Stripe
2. Click **Add Product**
3. Inserisci:
   - **Name**: Gallery Pro Monthly
   - **Description**: Monthly subscription for branded photo gallery
   - **Pricing**: Recurring
   - **Price**: €29.00 EUR
   - **Billing period**: Monthly
4. Click **Save Product**
5. **COPIA IL PRICE ID** (es. `price_1234567890abcdef`) - servirà nel codice

## Step 3: Ottieni API Keys

1. Vai su **Developers > API Keys**
2. Copia:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)
3. Aggiungi a `.env.local`:

```bash
# Stripe Keys (TEST MODE)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

## Step 4: Configura Webhook

1. Vai su **Developers > Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://YOUR-PROJECT-ID.cloudfunctions.net/handleStripeWebhook`
   - (Otterrai questo URL dopo deploy Cloud Functions)
4. Eventi da ascoltare:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Click **Add endpoint**
6. **COPIA IL WEBHOOK SECRET** (whsec_...)
7. Aggiungi a Firebase Functions config:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"
```

## Step 5: Configura Firebase Functions

Nel file `functions/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
STRIPE_PRICE_ID=price_1234567890abcdef
```

## Step 6: Test Mode vs Live Mode

**MVP: USA TEST MODE**

- Tutti i key iniziano con `pk_test_` e `sk_test_`
- Test card: `4242 4242 4242 4242` (qualsiasi CVV/data futura)
- Nessun addebito reale

**Quando sei pronto per produzione:**

1. Completa verifica account Stripe
2. Switch a **Live Mode** nel dashboard
3. Ottieni nuove API keys (pk_live_, sk_live_)
4. Aggiorna .env con live keys
5. Configura webhook per URL produzione

## Step 7: Verifica Setup

Dopo deploy Cloud Functions:

```bash
# Test webhook locale
stripe listen --forward-to localhost:5001/YOUR-PROJECT/us-central1/handleStripeWebhook

# Trigger test event
stripe trigger checkout.session.completed
```

## Prezzi Stripe (per riferimento)

- **2.9% + €0.30** per transazione riuscita
- **€29/mese subscription = €0.84 + €0.30 = €1.14 Stripe fee**
- **Tuo netto: €27.86 per cliente**

## Risorse

- [Stripe Docs - Checkout](https://stripe.com/docs/checkout)
- [Stripe Docs - Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Docs - Testing](https://stripe.com/docs/testing)

