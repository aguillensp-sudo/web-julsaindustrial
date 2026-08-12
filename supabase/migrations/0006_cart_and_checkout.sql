-- Carrito multi-producto + checkout con 3 métodos de pago.
-- Aditiva: no toca order_status (sigue siendo el estado logístico gestionado
-- por el admin). payment_status es ortogonal y refleja si el dinero ya entró.

create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

alter table public.orders
  add column payment_method text not null default 'bank_transfer'
    check (payment_method in ('bank_transfer', 'stripe', 'tropipay')),
  add column payment_status payment_status not null default 'pending',
  add column tropipay_reference text;

alter table public.stripe_transactions
  add column order_id uuid references public.orders(id) on delete set null,
  add column stripe_payment_intent_id text;

create index if not exists idx_stripe_transactions_order on public.stripe_transactions(order_id);
create index if not exists idx_stripe_transactions_pi on public.stripe_transactions(stripe_payment_intent_id);
