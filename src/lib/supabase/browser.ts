"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para Client Components.
 * ANON key + RLS. Sesión sincronizada con cookies vía @supabase/ssr.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
