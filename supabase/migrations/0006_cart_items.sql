-- Carrito de la compra real.
--
-- Hasta ahora la ficha de producto creaba directamente un pedido de una sola
-- línea: no había carrito, y un cliente que quisiera dos artículos tenía que
-- hacer dos pedidos. Se añade cart_items, el carrito persistente del cliente,
-- que al finalizar se convierte en UN pedido con varias líneas.
--
-- Una fila por (cliente, producto): añadir dos veces el mismo producto suma
-- cantidades en lugar de duplicar la línea.

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create index if not exists cart_items_customer_idx
  on public.cart_items (customer_id);

drop trigger if exists trg_cart_items_touch on public.cart_items;
create trigger trg_cart_items_touch before update on public.cart_items
  for each row execute function public.touch_updated_at();

-- RLS: el carrito es estrictamente privado de cada cliente. Ni siquiera el
-- admin lo necesita (solo ve pedidos ya realizados).
alter table public.cart_items enable row level security;

drop policy if exists "cart owner select" on public.cart_items;
create policy "cart owner select" on public.cart_items
  for select using (auth.uid() = customer_id);

drop policy if exists "cart owner insert" on public.cart_items;
create policy "cart owner insert" on public.cart_items
  for insert with check (auth.uid() = customer_id);

drop policy if exists "cart owner update" on public.cart_items;
create policy "cart owner update" on public.cart_items
  for update using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

drop policy if exists "cart owner delete" on public.cart_items;
create policy "cart owner delete" on public.cart_items
  for delete using (auth.uid() = customer_id);

grant select, insert, delete on public.cart_items to authenticated;
grant update (quantity, updated_at) on public.cart_items to authenticated;

-- El checkout crea el pedido y después sus líneas; si las líneas fallan hay
-- que poder deshacer el pedido para no dejar pedidos vacíos en "Mis pedidos".
-- Solo eso: pedido propio, aún en pago y sin ninguna línea.
drop policy if exists "orders owner delete empty" on public.orders;
create policy "orders owner delete empty" on public.orders
  for delete using (
    customer_id = auth.uid()
    and status = 'in_payment'
    and not exists (
      select 1 from public.order_items i where i.order_id = orders.id
    )
  );

grant delete on public.orders to authenticated;
