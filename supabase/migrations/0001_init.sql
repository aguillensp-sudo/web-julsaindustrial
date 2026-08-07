-- Web Julsa Industrial — esquema inicial Release 1.
-- design.md §Data model. Tipos en inglés snake_case (base-standards §2).
-- RLS obligatorio (Perfil B): los clientes solo ven/editan lo suyo; el admin
-- gestiona todo. La service role (createAdminClient) bypassa RLS.

create extension if not exists "pgcrypto";

-- Enums
create type product_line as enum ('fuels', 'energy', 'autoparts', 'raw_materials');
create type customer_status as enum ('pending_verification', 'active', 'suspended');
create type order_status as enum ('in_payment', 'ready_for_delivery');

-- customers: perfil de cliente ligado a auth.users
create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  contact_name text not null,
  phone text,
  location text,
  status customer_status not null default 'pending_verification',
  created_at timestamptz not null default now()
);

-- admin_users: marca qué auth.users son administradores (personal Julsa)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- products: catálogo. precio visible en portal; el público no lo muestra.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  line product_line not null,
  name text not null,
  description text,
  image_path text,
  price_usd numeric(10,2) not null check (price_usd >= 0),
  unit text not null default 'unidad',
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- orders: pedido. Release 1: in_payment -> ready_for_delivery (manual admin).
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  status order_status not null default 'in_payment',
  total_usd numeric(12,2) not null default 0 check (total_usd >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- order_items: snapshot del precio en fecha de pedido.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_usd numeric(10,2) not null check (unit_price_usd >= 0),
  line_total_usd numeric(12,2) generated always as (quantity * unit_price_usd) stored
);

-- payment_proofs: comprobante subido por el cliente.
create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  file_path text not null,
  uploaded_at timestamptz not null default now()
);

-- updated_at trigger para products y orders
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_orders_touch on public.orders;
create trigger trg_orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Trigger: auto-crear customer 'active' al confirmar email.
-- Supabase ejecuta este trigger sobre auth.users tras email confirm.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.customers (id, company_name, contact_name, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'company_name', 'Pendiente'),
    coalesce(new.raw_user_meta_data->>'contact_name', split_part(new.email,'@',1)),
    'active'  -- auto-registro puro: activo tras confirmar email
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.customers enable row level security;
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_proofs enable row level security;

-- Helper: ¿el usuario actual es admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- customers: cada cliente ve/edita solo SU fila.
create policy "customers self select" on public.customers
  for select using (auth.uid() = id or public.is_admin());
create policy "customers self update" on public.customers
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- admin_users: solo visible para admins.
create policy "admin_users admin only" on public.admin_users
  for select using (public.is_admin());

-- products: SELECT público (catálogo); escritura solo admin.
create policy "products public read" on public.products
  for select using (true);
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: cliente dueño ve/suas; admin todo.
create policy "orders owner or admin" on public.orders
  for select using (
    customer_id in (select id from public.customers where id = auth.uid())
    or public.is_admin()
  );
create policy "orders customer insert" on public.orders
  for insert with check (
    customer_id in (select id from public.customers where id = auth.uid())
  );
-- UPDATE de estado solo admin:
create policy "orders admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- order_items: hereda visibilidad del pedido.
create policy "order_items via order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.customer_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items customer insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = auth.uid()
    )
  );

-- payment_proofs: cliente dueño o admin.
create policy "proofs owner or admin" on public.payment_proofs
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.customer_id = auth.uid() or public.is_admin())
    )
  );
create policy "proofs customer insert" on public.payment_proofs
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = auth.uid()
    )
  );

-- ============================================================
-- Storage buckets
-- product-images: público (lectura pública). payment-proofs: privado.
-- (Crear los buckets desde el panel de Supabase o vía SQL de storage.)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- product-images: lectura pública, escritura admin.
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product images admin write" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

-- payment-proofs: lectura/escritura del dueño del pedido o admin.
create policy "proofs owner read" on storage.objects
  for select using (
    bucket_id = 'payment-proofs'
    and exists (
      select 1 from public.payment_proofs p
      join public.orders o on o.id = p.order_id
      where p.file_path = name
        and (o.customer_id = auth.uid() or public.is_admin())
    )
  );
create policy "proofs owner write" on storage.objects
  for insert with check (
    bucket_id = 'payment-proofs'
    and auth.uid() is not null
  );
