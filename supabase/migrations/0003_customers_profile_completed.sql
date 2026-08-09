-- Explicit flag for incomplete profiles instead of comparing company_name
-- against the 'Pendiente' fallback string (fragile: contact_name's
-- fallback isn't a fixed string, it's split_part(email, '@', 1)).
alter table public.customers
  add column if not exists profile_completed boolean not null default true;

-- Backfill: best-effort detection for rows already created by the old
-- trigger, so existing "Pendiente" accounts are flagged for completion.
update public.customers
set profile_completed = false
where company_name = 'Pendiente';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.customers (id, company_name, contact_name, status, profile_completed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'company_name', 'Pendiente'),
    coalesce(new.raw_user_meta_data->>'contact_name', split_part(new.email,'@',1)),
    'active',  -- auto-registro puro: activo tras confirmar email
    (new.raw_user_meta_data->>'company_name' is not null
      and new.raw_user_meta_data->>'contact_name' is not null)
  )
  on conflict (id) do nothing;
  return new;
end; $$;
