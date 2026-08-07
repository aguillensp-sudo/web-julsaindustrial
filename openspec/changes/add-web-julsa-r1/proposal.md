# Proposal — Web Julsa Industrial · Release 1

**Change ID:** `add-web-julsa-r1`
**Profile:** B — Aplicación web
**Status:** Proposed (Fase 2 + Fase 3 aprobadas por el Product Owner)
**Source of truth:** `docs/fase2-define-spec.md` (v0.3) · `docs/fase3-design.md` (v0.1)

## What & Why

Web corporativa + portal privado para Julsa Industrial (importación/distribución
en Cuba desde 2010). Dos zonas:

- **Pública:** escaparate de la empresa y sus 4 líneas de producto (combustibles,
  equipamiento energético, autopartes, materias primas). Objetivo: generar
  confianza y dirigir al registro.
- **Privada (portal):** catálogo con precios en USD, creación de pedidos con
  comprobante de pago subido por el cliente, historial de pedidos.

## Release 1 scope (this change)

- Portal con catálogo y precios en USD.
- Pedidos como **solicitud sin cobro** dentro de la web; el cliente paga fuera y
  sube el comprobante; el admin mueve el estado manualmente entre
  *En proceso de pago* → *Disponible para entrega*.
- Stock manual gestionado desde el panel admin (sin ERP).
- Auto-registro con verificación de email.
- Panel admin que gobierna toda la web (productos, precios, stock, clientes,
  pedidos, comprobantes).

## Release 2 (out of scope, architecture leaves room)

- Checkout / pasarela de pago dentro de la web.

## Out of scope

- Módulo de consultas/mensajes (no existe en este proyecto).
- Blog, seguimiento logístico automatizado, conversión de moneda.

## Exit criteria (acceptance)

Ver `docs/fase2-define-spec.md` §4. Resumen: WCAG AA esencial, SEO on-page,
Lighthouse ≥90, auth/autorización probadas (401/403 a no-autenticados),
validación server-side, comprobantes validados, secretos fuera del código,
tests verde y cobertura ≥90%, RGPD con textos legales del PO.

## Tech stack

- Frontend: Next.js + TypeScript (App Router).
- Backend: Next.js route handlers / server actions + Supabase (Postgres, Auth,
  Storage) con RLS.
- Deploy: Vercel (Next.js) + Supabase.
