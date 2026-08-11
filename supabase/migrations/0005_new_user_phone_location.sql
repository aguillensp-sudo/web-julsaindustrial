-- Revisión 11-08-2026 §1: el formulario de registro envía phone y location en
-- user_metadata, pero handle_new_user solo copiaba company_name y contact_name,
-- así que esos datos nunca llegaban a public.customers.
-- Se recuperan ambos en el alta (cadena vacía -> null).

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.customers (id, company_name, contact_name, phone, location, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'company_name', 'Pendiente'),
    coalesce(new.raw_user_meta_data->>'contact_name', split_part(new.email,'@',1)),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'location', '')), ''),
    'active'  -- auto-registro puro: activo tras confirmar email
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
