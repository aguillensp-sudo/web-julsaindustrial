import { createClient } from "@/lib/supabase/server";

/**
 * Helpers de sesión para el portal y admin (server-side).
 * Si no hay sesión, devuelve user null para que la página redirija a login
 * (el middleware ya bloquea /portal y /admin, esto es defensa en profundidad).
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentCustomer() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}
