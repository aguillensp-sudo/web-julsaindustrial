-- Soft delete for products: admin "baja" hides a product from the customer
-- portal without breaking the FK from order_items (on delete restrict would
-- block a hard delete for any product referenced by a past order).
alter table public.products
  add column if not exists is_active boolean not null default true;
