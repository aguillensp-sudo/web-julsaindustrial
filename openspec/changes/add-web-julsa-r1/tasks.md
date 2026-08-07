# Tasks — Web Julsa Industrial · Release 1

> Desglose ejecutable, ordenado por dependencia. Una tarea = una unidad de
> trabajo para web-coder, validada por web-validator antes de la siguiente.
> Las `[block]` dependen de inputs del PO. Perfil B → TDD donde aplique.

## Hito 1 — Cimientos

- [ ] 1.1 Inicializar Next.js (App Router, TS, ESLint, Tailwind) + `.gitignore`
      + `README.md`. Commit base.
- [ ] 1.2 Añadir design tokens (`styles/tokens.css`) y configurar Open Sans vía
      `next/font`. Layout raíz con cabecera/pie vacíos. [ver fase3 §1]
- [ ] 1.3 Setup Supabase: dependencias (`@supabase/ssr`, `@supabase/supabase-js`),
      clients (browser/server/admin), middleware de sesión, env vars + `.env.example`.
- [ ] 1.4 Componentes UI base: Button (naranja AA), Card (--surface), Section,
      Header, Footer según fase3 §3.

## Hito 2 — Zona pública

- [ ] 2.1 Home (`/`): hero reel + secciones nosotros/líneas/contacto + CTA portal.
- [ ] 2.2 Nosotros (`/nosotros`): timeline historia, misión/visión, equipo,
      **mapa-red de Cuba (signature)** con 5 nodos y `prefers-reduced-motion`.
- [ ] 2.3 Catálogos: `/combustibles` (iconos), `/equipamiento-energetico`,
      `/autopartes`, `/materias-primas` (fotos) + banner de registro recurrente.
      Contenido de producto inicial quemado (seed) o desde brief.
- [ ] 2.4 Contacto (`/contacto`): formulario (Nombre/Tel/Email/Mensaje) con
      anti-spam + bloque de sedes con enlaces Google Maps.
- [ ] 2.5 SEO on-page: metadata por página, Open Graph, `sitemap.xml`, robots,
      datos estructurados (Organization).
- [ ] 2.6 Páginas legales (`/legal/*`): placeholders `[block]` esperando texto del PO.

## Hito 3 — Auth + Portal

- [ ] 3.1 Esquema DB + migraciones: tablas `customers`, `products`, `orders`,
      `order_items`, `payment_proofs`, `admin_users` + políticas RLS. [ver design]
- [ ] 3.2 Trigger: tras email confirmado, crear `customers` con `status='active'`.
- [ ] 3.3 Registro (`/portal/registro`) + email confirmation + login + recuperar.
- [ ] 3.4 Middleware de autorización: `/portal/*` requiere sesión; `/admin/*`
      requiere rol admin.
- [ ] 3.5 Catálogo portal (`/portal/catalogo`, `/portal/producto/[id]`): muestra
      precio USD y stock **solo a autenticados**.
- [ ] 3.6 Pedido: crear `orders`+`order_items` con precio snapshot.
- [ ] 3.7 Subida de comprobante (PDF/JPG/PNG ≤5MB) a Storage privado + registro
      en `payment_proofs`.
- [ ] 3.8 Mis pedidos (`/portal/mis-pedidos`): lista con semáforo de estados +
      ver/subir comprobante.

## Hito 4 — Panel admin

- [ ] 4.1 Productos CRUD (alta/edición/baja, imagen, precio USD, unidad, stock).
- [ ] 4.2 Pedidos: lista, ver comprobante, cambio de estado manual
      `in_payment` → `ready_for_delivery`.
- [ ] 4.3 Clientes: listar + activar/suspender.
- [ ] 4.4 Stock: edición manual (parte del CRUD de producto).

## Hito 5 — Calidad y release

- [ ] 5.1 Tests unit + integration (Vitest) → cobertura ≥90%.
- [ ] 5.2 e2e (Playwright): registro→login→pedido→comprobante; admin→estado.
- [ ] 5.3 Accesibilidad WCAG AA y Lighthouse ≥90 (Home + página pesada).
- [ ] 5.4 Revisión adversarial (web-validator): RLS, validación, secretos.
- [ ] 5.5 Textos legales definitivos `[block]` (PO) + reemplazo de placeholders.
- [ ] 5.6 Deploy a Vercel + Supabase (confirmación explícita del PO).
