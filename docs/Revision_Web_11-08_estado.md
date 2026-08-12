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

## Carrito real (rediseño posterior a la revisión)

El "carrito" no era tal: la ficha de producto creaba directamente un pedido de
una línea, así que dos artículos exigían dos pedidos. Ahora:

- Nueva tabla `cart_items` (migración `0006_cart_items.sql`), un carrito
  persistente por cliente con RLS propia. Una fila por producto: añadir el
  mismo producto dos veces suma cantidades.
- La ficha de producto tiene **"Añadir al carrito"** (ya no "Crear pedido").
- Nueva pantalla `/portal/carrito`: líneas con precio, cantidad editable,
  subtotal, total, quitar línea y avisos de stock.
- **"Finalizar pedido"** convierte todo el carrito en **un único pedido** con
  tantas líneas como productos, vacía el carrito y lleva a "Mis pedidos" para
  subir el comprobante. El precio unitario y el total los fija la base de datos
  (triggers de `0004`), nunca el cliente.
- La navegación del área privada lleva "Tienda" y "Carrito" con el número de
  artículos.

Se eliminan `OrderForm`/`orderActions` (flujo de un pedido por artículo) y sus
tests; se añaden tests de `cartActions`.

## Fusión con el checkout de pasarelas de pago

En el directorio principal había trabajo sin commitear con checkout de Stripe y
carrito en `localStorage`. Se ha fusionado: **se conserva ese checkout y se
sustituye su carrito de navegador por `cart_items` en base de datos**.

- `/portal/carrito` → "Finalizar pedido" lleva a `/portal/checkout`, que muestra
  el resumen (leído en servidor desde `cart_items`) y el método de pago:
  transferencia, tarjeta (Stripe) o TropiPay (deshabilitado, "próximamente").
- `createOrderFromCart` relee el carrito, el precio y el stock desde Supabase:
  nada de lo que envía el navegador influye en el importe cobrado.
- Tarjeta → sesión de Stripe Checkout; el webhook `/api/webhooks/stripe` marca
  `payment_status='paid'`. Transferencia → a "Mis pedidos" a subir comprobante.
- "Mis pedidos" muestra método y estado de pago, y permite reintentar el pago
  con tarjeta de un pedido pendiente. El admin ve ambos datos en listado y
  detalle, y al aprobar una transferencia salda también el pago.
- Migraciones `0007_stripe_setup.sql` (tablas de Stripe) y
  `0008_order_payment_fields.sql` (tipo `payment_status` y columnas de pago),
  **idempotentes**: la 0008 arregla el `create type payment_status` sin guarda
  que provocó el error "type payment_status already exists".
- Descartados del trabajo previo: `CartContext` (localStorage), `CartLink`,
  `CartView` y su `/portal/carrito`, sustituidos por la versión en BD.

## Pendiente de configuración en Supabase (no es código)

1. **Remitente de los emails** (punto 1): hoy salen desde el SMTP por defecto de
   Supabase. Hay que configurar SMTP propio en *Authentication → Emails → SMTP
   Settings* con el dominio de la empresa.
2. **Redirect URLs**: añadir `https://<dominio>/auth/callback` (y el de
   preview/local) en *Authentication → URL Configuration → Redirect URLs*, o los
   enlaces de confirmación y recuperación se rechazarán.
3. **Aplicar las migraciones en orden**: `0005_new_user_phone_location.sql`,
   `0006_cart_items.sql`, `0007_stripe_setup.sql` y
   `0008_order_payment_fields.sql`. Todas son relanzables sin romper nada.
   Ojo: la `0005` que se aplicó el 11-08 fue la de Stripe del directorio
   principal, **no** la de `phone`/`location`; esa sigue pendiente.
4. **Stripe**: definir `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, y dar de alta el endpoint
   `https://<dominio>/api/webhooks/stripe` en el panel de Stripe.

## No aplicable en la web actual

Nada: con la fusión del checkout, el punto 5 (iconos de las tarjetas aceptadas
en "Finalizar pedido") también queda hecho — Visa, Mastercard y American Express
en SVG junto a la opción de pago con tarjeta.
