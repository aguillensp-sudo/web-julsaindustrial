import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware de sesión: refresca el token de Supabase en cada request y
 * protege rutas. fase2-define-spec §3 / design.md (auth & authorization).
 *
 * - /portal/* requiere sesión (no autenticado → redirect a /portal/login).
 * - /admin/* requiere rol admin (no admin → redirect a /portal/login o 404).
 *
 * La comprobación de rol admin consulta la tabla admin_users; para evitar
 * una query por request en cada ruta, se cachinga en la sesión si procede.
 */
async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Rutas de auth accesibles sin sesión (no se protegen).
  // /portal/actualizar-password NO va aquí: es una página protegida normal
  // (requiere sesión) — la sesión que la protege es justo la de recovery
  // que /auth/callback acaba de crear tras el enlace del email.
  const isAuthRoute =
    path === "/portal/login" ||
    path === "/portal/registro" ||
    path === "/portal/recuperar";

  // Proteger portal: requiere sesión (salvo las rutas de auth).
  if (path.startsWith("/portal") && !isAuthRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Si ya hay sesión y el usuario visita una ruta de auth, llevarlo al portal.
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Proteger admin: requiere sesión Y rol admin.
  if (path.startsWith("/admin") && user) {
    const { data: admin } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal/login";
      return NextResponse.redirect(url);
    }
  } else if (path.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
