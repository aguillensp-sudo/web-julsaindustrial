-- Método y estado de pago del pedido (checkout con pasarelas).
--
-- payment_status es ortogonal a order_status: order_status es el estado
-- logístico que gestiona el admin; payment_status refleja si el dinero entró.
--
-- Todo el fichero es idempotente: puede relanzarse aunque una ejecución
-- anterior se quedara a medias (que es justo lo que pasó al aplicar esto por
-- primera vez, dejando el tipo creado y las columnas sin crear).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end $$;

alter table public.orders
  add column if not exists payment_method text not null default 'bank_transfer',
  add column if not exists payment_status payment_status not null default 'pending',
  add column if not exists tropipay_reference text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_payment_method_check'
  ) then
    alter table public.orders
      add constraint orders_payment_method_check
      check (payment_method in ('bank_transfer', 'stripe', 'tropipay'));
  end if;
end $$;

alter table public.stripe_transactions
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists stripe_payment_intent_id text;

create index if not exists idx_stripe_transactions_order
  on public.stripe_transactions(order_id);
create index if not exists idx_stripe_transactions_pi
  on public.stripe_transactions(stripe_payment_intent_id);

-- El cliente crea el pedido eligiendo método de pago; el estado del pago solo
-- lo mueven el webhook de Stripe y el admin, ambos con la service role (que
-- bypassa RLS y los grants de columna).
revoke update on public.orders from authenticated;
