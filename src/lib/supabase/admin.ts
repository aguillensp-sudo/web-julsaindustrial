import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente privilegiado (service role key). SOLO server-side, NUNCA en el cliente.
 * Sirve para operaciones del admin que bypassan RLS (gestión de productos,
 * cambio de estado de pedidos, suspensión de clientes).
 * La service key debe vivir en env vars, nunca en el bundle.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations",
    );
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
