-- Fase C adversarial review — RLS hardening (fixes verified against the live
-- schema in 0001_init.sql / 0002_products_is_active.sql /
-- 0003_customers_profile_completed.sql).

-- ============================================================
-- 1. payment-proofs storage: INSERT policy did not scope the path to the
--    caller's own folder, so any authenticated user could write into
--    another customer's `<uuid>/...` prefix (the app always uploads to
--    `${user.id}/${orderId}/...`, but nothing in the DB enforced that).
-- ============================================================
drop policy if exists "proofs owner write" on storage.objects;
create policy "proofs owner write" on storage.objects
  for insert with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 2. customers: the self-update policy let a customer PATCH any column on
--    their own row, including `status` -- a customer suspended by the
--    admin (setCustomerStatus) could reactivate themselves directly via
--    PostgREST with the anon key + their session. Restrict self-service
--    UPDATE to the columns completeProfile actually needs to write;
--    `status` (and `id`) stay writable only by the service role (which
--    bypasses column grants same as it bypasses RLS).
-- ============================================================
revoke update on public.customers from authenticated;
grant update (company_name, contact_name, phone, location, profile_completed)
  on public.customers to authenticated;

-- ============================================================
-- 3/4. orders.total_usd and order_items.unit_price_usd were client-supplied
--    values only protected by app-level trust (createOrder computes them
--    correctly, but nothing stopped a direct PostgREST INSERT with forged
--    values). Enforce price integrity at the DB layer instead of trusting
--    the caller:
--    - order_items.unit_price_usd is always overwritten from the current
--      products.price_usd for the given product_id, regardless of what
--      the client sent.
--    - orders.total_usd is forced to 0 on insert, then recomputed from the
--      sum of its order_items every time a line is added. This matches
--      createOrder's insert order (orders row first, then its item) and
--      leaves the same end result for legitimate requests, since the
--      order response is only read by the app after both inserts commit.
-- ============================================================
create or replace function public.set_order_item_price()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_price numeric(10,2);
begin
  select price_usd into v_price from public.products where id = new.product_id;
  if v_price is null then
    raise exception 'invalid product_id';
  end if;
  new.unit_price_usd := v_price;
  return new;
end; $$;

drop trigger if exists trg_order_items_price on public.order_items;
create trigger trg_order_items_price
  before insert on public.order_items
  for each row execute function public.set_order_item_price();

create or replace function public.reset_order_total_on_insert()
returns trigger language plpgsql as $$
begin
  new.total_usd := 0;
  return new;
end; $$;

drop trigger if exists trg_orders_reset_total on public.orders;
create trigger trg_orders_reset_total
  before insert on public.orders
  for each row execute function public.reset_order_total_on_insert();

create or replace function public.recompute_order_total()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.orders
  set total_usd = coalesce(
    (select sum(line_total_usd) from public.order_items where order_id = new.order_id),
    0
  )
  where id = new.order_id;
  return new;
end; $$;

drop trigger if exists trg_order_items_recompute_total on public.order_items;
create trigger trg_order_items_recompute_total
  after insert on public.order_items
  for each row execute function public.recompute_order_total();

-- ============================================================
-- 5. products: SELECT was `using (true)`, readable by the `anon` role --
--    any unauthenticated visitor could dump the full B2B price list and
--    stock via PostgREST, even though the design intends prices to be
--    portal-only (0001_init.sql comment: "el público no lo muestra").
--    Restrict to the `authenticated` role (still no session -> no read).
-- ============================================================
drop policy if exists "products public read" on public.products;
create policy "products authenticated read" on public.products
  for select to authenticated using (true);
