# Estado de la revisión web 11-08-2026

Resultado de aplicar `docs/Revision_Web_11-08.md`.

## Hecho en código

| Punto | Cambio |
| --- | --- |
| 1. Campos obligatorios | Razón social, contacto, email y contraseña marcados con `*`, con aviso de campos obligatorios. El botón "Crear cuenta" está deshabilitado hasta que los cuatro son válidos. |
| 1. Validación de email | Validación de formato en cliente con mensaje bajo el campo. |
| 1. Ubicación / sede | Campo oculto (`input type="hidden"`); se sigue enviando a Supabase en `user_metadata`. |
| 1. Texto del alta | "Cree su usuario para consultar nuestros productos y realizar pedidos." |
| 1. Enlace del email | Nueva ruta `/auth/callback`: canjea el código y entra directamente en `/portal` (antes caía en la landing sin sesión). |
| 1. phone / location en Supabase | Migración `0005_new_user_phone_location.sql`: `handle_new_user` copia ahora `phone` y `location` del metadata a `public.customers`. |
| 2. Portal | Caja "Catálogo y precios" → **Tienda** / "Ver productos y realizar pedidos". |
| 3. Navegación | Barra de navegación en todas las pantallas del área de cliente: "← Volver al portal", "Carrito", "Mis pedidos" y "Cerrar sesión". |
| 4. Mis pedidos | Cada línea indica si ya hay comprobante adjunto, con fecha y enlace "Ver comprobante" (URL firmada, 5 min). Subir uno nuevo **sustituye** al anterior: un único archivo por pedido. |
| 4. Admin | El listado de pedidos marca "Comprobante adjunto ✓" / "Sin comprobante"; el detalle ya permitía verlo con URL firmada. |
| 5. Tamaño de enlaces | Enlaces de navegación del área privada a 15px (+2px). |
| 5. Icono de carrito | Icono SVG junto a "Carrito". |
| 6. Olvidé mi contraseña | El email lleva a `/auth/callback?next=/portal/restablecer` y a la nueva pantalla `/portal/restablecer`, donde sí se cambia la contraseña. |
| 7. Favicon | Se elimina `src/app/favicon.ico` (obsoleto); queda `src/app/icon.png`, que es exactamente `docs/favicon-ji.png`. |

## Pendiente de configuración en Supabase (no es código)

1. **Remitente de los emails** (punto 1): hoy salen desde el SMTP por defecto de
   Supabase. Hay que configurar SMTP propio en *Authentication → Emails → SMTP
   Settings* con el dominio de la empresa.
2. **Redirect URLs**: añadir `https://<dominio>/auth/callback` (y el de
   preview/local) en *Authentication → URL Configuration → Redirect URLs*, o los
   enlaces de confirmación y recuperación se rechazarán.
3. **Aplicar la migración** `supabase/migrations/0005_new_user_phone_location.sql`.

## No aplicable en la web actual

- **Iconos de tarjetas en "Finalizar pedido"** (punto 5): la web no tiene
  pantalla de finalizar pedido ni selección de método de pago. El flujo actual
  es crear pedido → subir comprobante de pago. Cuando exista la pasarela se
  añaden ahí los iconos de las tarjetas aceptadas.
- El punto 5 menciona un "carrito": no existe carrito de la compra; el pedido se
  crea desde la ficha de producto. El enlace "Carrito" del área privada apunta a
  la tienda (catálogo).
