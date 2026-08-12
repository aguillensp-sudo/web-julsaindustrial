import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});

const supabase = createAdminClient();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Webhook verification failed:', message);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handlePaymentSuccess(session);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  console.log('✅ Payment successful:', session.id);

  const orderId = session.client_reference_id ?? session.metadata?.order_id ?? null;

  const { error } = await supabase.from('stripe_transactions').insert({
    stripe_session_id: session.id,
    stripe_customer_id: session.customer,
    stripe_payment_intent_id: session.payment_intent?.toString(),
    order_id: orderId,
    amount: session.amount_total,
    currency: session.currency,
    status: 'completed',
    metadata: session.metadata,
    email: session.customer_email,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error saving transaction:', error);
    throw new Error('Failed to save transaction');
  }

  if (!orderId) {
    console.warn('checkout.session.completed sin order_id asociado:', session.id);
    return;
  }

  // Filtro por payment_status='pending' hace el update idempotente ante reintentos.
  const { error: orderError } = await supabase
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('id', orderId)
    .eq('payment_status', 'pending');

  if (orderError) {
    console.error('Error updating order payment_status:', orderError);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);

  const { error } = await supabase.from('stripe_transactions').insert({
    stripe_session_id: paymentIntent.id,
    stripe_customer_id: paymentIntent.customer?.toString(),
    stripe_payment_intent_id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'failed',
    error_message: paymentIntent.last_payment_error?.message,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error saving failed transaction:', error);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('💸 Refund processed:', charge.id);

  const paymentIntentId = charge.payment_intent?.toString();

  const { data: transaction, error: fetchError } = await supabase
    .from('stripe_transactions')
    .update({ status: 'refunded', refunded_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .select('order_id')
    .maybeSingle();

  if (fetchError) {
    console.error('Error updating refund:', fetchError);
    return;
  }

  if (transaction?.order_id) {
    const { error: orderError } = await supabase
      .from('orders')
      .update({ payment_status: 'refunded' })
      .eq('id', transaction.order_id);

    if (orderError) {
      console.error('Error marking order as refunded:', orderError);
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('📅 Subscription updated:', subscription.id);

  const item = subscription.items.data[0];

  const { error } = await supabase.from('stripe_subscriptions').upsert(
    {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer?.toString(),
      status: subscription.status,
      current_period_start: item ? new Date(item.current_period_start * 1000) : null,
      current_period_end: item ? new Date(item.current_period_end * 1000) : null,
      metadata: subscription.metadata,
    },
    { onConflict: 'stripe_subscription_id' }
  );

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log('❌ Subscription cancelled:', subscription.id);

  const { error } = await supabase
    .from('stripe_subscriptions')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error cancelling subscription:', error);
  }
}
