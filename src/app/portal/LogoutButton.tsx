"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

/** Cierra sesión y vuelve a la home pública. */
export function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={handleLogout}
      className="text-[15px] no-underline text-[var(--link)] hover:underline"
    >
      Cerrar sesión
    </button>
  );
}
