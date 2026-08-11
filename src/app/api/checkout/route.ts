import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrderCheckoutSession } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({ orderId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
  }
  const { orderId } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(
      'id, customer_id, payment_status, order_items(quantity, unit_price_usd, products(name))',
    )
    .eq('id', orderId)
    .maybeSingle();

  if (orderError || !order || order.customer_id !== user.id) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }
  if (order.payment_status !== 'pending') {
    return NextResponse.json({ error: 'Este pedido ya fue procesado' }, { status: 409 });
  }

  const items = order.order_items as unknown as {
    quantity: number;
    unit_price_usd: number;
    products: { name: string } | null;
  }[];
  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'El pedido no tiene productos' }, { status: 400 });
  }

  const lineItems = items.map((item) => ({
    name: item.products?.name ?? 'Producto',
    unitAmountCents: Math.round(Number(item.unit_price_usd) * 100),
    quantity: item.quantity,
  }));

  const successUrl = `${origin}/portal/checkout/success?order_id=${orderId}`;
  const cancelUrl = `${origin}/portal/checkout?cancelled=1`;

  try {
    const session = await createOrderCheckoutSession({
      orderId,
      lineItems,
      successUrl,
      cancelUrl,
      email: user.email,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout session creation failed';
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
