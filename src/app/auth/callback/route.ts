import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de los emails de Supabase Auth (confirmación de cuenta y
 * recuperación de contraseña).
 *
 * Antes de existir esta ruta, el enlace del email apuntaba a la landing y el
 * usuario se quedaba fuera del área privada. Aquí se canjea el código por una
 * sesión (cookies) y se redirige al destino real:
 *   - confirmación de cuenta  → /portal
 *   - recuperación (type=recovery) → /portal/restablecer
 *
 * Soporta los dos formatos de enlace de Supabase: PKCE (?code=) y OTP
 * (?token_hash=&type=).
 */
function safeNext(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const fallback = type === "recovery" ? "/portal/restablecer" : "/portal";
  const next = safeNext(url.searchParams.get("next"), fallback);

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "recovery" | "email" | "email_change" | "invite",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }

  // Enlace inválido o caducado: al login con aviso.
  const loginUrl = new URL("/portal/login", url.origin);
  loginUrl.searchParams.set("error", "link");
  return NextResponse.redirect(loginUrl);
}
