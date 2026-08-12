import Stripe from 'stripe';

/**
 * Cliente de Stripe perezoso: instanciarlo al importar el módulo rompe el
 * build cuando STRIPE_SECRET_KEY no está definida (por ejemplo en un preview
 * sin las claves configuradas). Se crea en la primera llamada real y se
 * reutiliza después.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('STRIPE_SECRET_KEY no está configurada.');
  client = new Stripe(apiKey, { apiVersion: '2026-07-29.dahlia' });
  return client;
}

export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  email,
  metadata,
}: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  email?: string;
  metadata?: Record<string, string>;
}) {
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
    metadata,
  });

  return session;
}

export async function createSubscriptionSession({
  priceId,
  successUrl,
  cancelUrl,
  email,
  trialDays,
  metadata,
}: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  email?: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}) {
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
    subscription_data: {
      trial_period_days: trialDays,
      metadata,
    },
  });

  return session;
}

/**
 * Checkout Session para un pedido propio del dominio Julsa (orders/order_items),
 * con line items dinámicos por precio de catálogo en vez de un Price ID fijo.
 */
export async function createOrderCheckoutSession({
  orderId,
  lineItems,
  successUrl,
  cancelUrl,
  email,
}: {
  orderId: string;
  lineItems: { name: string; unitAmountCents: number; quantity: number }[];
  successUrl: string;
  cancelUrl: string;
  email?: string;
}) {
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems.map((li) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: li.name },
        unit_amount: li.unitAmountCents,
      },
      quantity: li.quantity,
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
    client_reference_id: orderId,
    metadata: { order_id: orderId },
  });

  return session;
}

export async function getCustomer(customerId: string) {
  return await getStripe().customers.retrieve(customerId);
}

export async function createCustomer({
  email,
  name,
  metadata,
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  return await getStripe().customers.create({
    email,
    name,
    metadata,
  });
}

export async function refundPayment(chargeId: string, amount?: number) {
  return await getStripe().refunds.create({
    charge: chargeId,
    amount,
  });
}
