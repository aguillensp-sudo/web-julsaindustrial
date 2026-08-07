# Especificación de Producto — Web Julsa Industrial

**Fase:** 2 · Definición (Spec-Driven Development)
**Perfil:** B — Aplicación web (backend propio, portal de usuario con catálogo de precios y pedidos)
**Estado:** **v0.3 — Pendiente de aprobación del Product Owner**
**Origen:** `Definiciones Previas.md` (Fase Discover, Jun 2026) + decisiones del PO (Ago 2026)
**Versión spec:** v0.3 · Agosto 2026 (modelo de pedido y scope Release 1/2 cerrados)

> **Cómo leer esto.** Es la fuente de verdad del proyecto: nada se construye sin que
> esto esté aprobado. Las marcas `[PO]` son decisiones pendientes del Product Owner.

---

## 1. Resumen del proyecto

Julsa Industrial es una empresa española radicada en Cuba desde hace más de 15 años,
dedicada a la **importación y distribución** de combustibles, materias primas
industriales, equipamiento energético y autopartes. La web tiene **dos zonas**:

- **Zona pública (escaparate):** presenta la empresa, sus líneas de producto y sus
  sedes. Su objetivo es generar confianza y **dirigir al registro** en el portal.
- **Zona privada (portal de cliente):** el cliente registrado accede al catálogo con
  **precios en USD**, crea pedidos y sube su comprobante de pago.

**Objetivo medible (KPI confirmado por PO):** nº de cuentas de cliente activas y
nº de pedidos mensuales a 6 meses del lanzamiento. (La declaración de misión del
brief *"contribuir al desarrollo sostenible..."* no es medible y queda fuera como
métrica de éxito.)

**Release 1 (este proyecto):** portal con catálogo y precios en USD; pedidos como
solicitud con **comprobante de pago subido por el cliente** (el cobro ocurre fuera
de la web); estados del pedido gestionados manualmente por el admin; stock manual.
**Release 2 (futuro, contemplado):** checkout/pasarela de pago dentro de la web.
La arquitectura de Release 1 se diseña para admitirlo sin rework.
**Fuera de scope:** módulo de consultas/mensajes, blog, seguimiento logístico
automatizado.

---

## 2. Arquitectura de contenido — Zona pública

### Navegación principal
Inicio · Nosotros · Combustibles · Equipamiento energético · Autopartes · Materias
primas · Contacto · **Acceso clientes** (CTA a portal). Solo español, sin selector
de idioma.

### Inicio (`/`)
**Objetivo:** transmitir solidez industrial y dirigir al portal.
Bloques, en orden:
1. **Hero / reel** — carrusel con imágenes (ISO tanques, balitas de gas, placas
   solares) + texto descriptivo + CTA "Acceso clientes".
2. **Sobre nosotros** — resumen + enlace a `/nosotros`.
3. **Líneas de producto** — 4 accesos rápidos (Combustibles, Equipamiento,
   Autopartes, Materias primas).
4. **Contacto / sedes** — resumen + enlace a `/contacto`.
5. **CTA portal** — bloque impulsando registro ("cree su usuario y acceda a su
   área personal").

**Origen contenido:** textos a redactar; imágenes: parte Alvaro, parte selección
del coder (iconos para Combustibles, fotos para el resto).

### Nosotros (`/nosotros`)
**Objetivo:** generar credibilidad con 15+ años de trayectoria.
- **Historia** — timeline: 2010 fundación → 2013 rodamientos → 2015 materias
  primas → 2018 industria del cable → 2021 Fawalt Investment S.L. → 2026
  combustibles.
- **Misión / Visión** — los tres párrafos del brief.
- **Equipo** — plantilla en La Habana + red de socios/distribuidores.
- **Mapa interactivo de Cuba** con 5 emplazamientos: La Habana, Cienfuegos,
  Camagüey, Holguín, Bayamo.

### Catálogos de producto (4 páginas)
Cada producto se presenta en **bloque con imagen + descripción**. Bajo cada
catálogo, un **banner recurrente** impulsa el registro:
> *"Para conocer en detalle los productos que suministramos, cree un usuario y
> acceda a su área personal (...). Anímese, entre y verifique nuestros precios,
> los mejores en Cuba!"*

- **Combustibles (`/combustibles`)** — iconos (elige el coder): Gasolina,
  Petróleo, Balitas de gas.
- **Equipamiento energético (`/equipamiento-energetico`)** — fotos (Alvaro):
  Placas solares (paneles monocristalinos bifaciales 630W), Baterías (2,5–15
  kWh), Inversores (600W–10kW).
- **Autopartes (`/autopartes`)** — fotos (Alvaro): Baterías, Neumáticos,
  Lubricantes.
- **Materias primas e insumos (`/materias-primas`)** — fotos (Alvaro):
  Acerías (Sílico manganeso, Ferrosilicio, Electrodos de grafito) e Industrias
  del papel (Pulpa de celulosa, `[?] Trotman` — pendiente Alvaro).

### Contacto (`/contacto`)
- **Formulario:** Nombre, Teléfono, Email, Mensaje (con anti-spam).
- **Datos de contacto:** Julsa Industrial S.A. · Tfno `+53 72636260` · dos sedes:
  - La Habana: `c/202, #1918, e/19 y 21, Siboney, Playa, La Habana, Cuba` ·
    [Google Maps](https://maps.app.goo.gl/kewUXkNbjRTr2mrN9).
  - Madrid: `c/Núñez de Balboa, 118, 1ºI, Madrid, España` · enlace Google Maps.

### Estructura transversal
- **Cabecera:** logo, menú, redes sociales, CTA "Acceso clientes".
- **Pie:** información de contacto, mapa web, políticas (privacidad, cookies),
  enlace al portal.
- **Páginas legales obligatorias:** Aviso legal · Política de privacidad ·
  Política de cookies — texto a aportar por el PO.

---

## 3. Arquitectura de aplicación — Zona privada (portal)

> Esta sección es la diferencia con Perfil A. Aquí vive el backend, la auth y la
> lógica de negocio.

### Flujos del portal (cliente)
- **Registro** — auto-registro con **solo verificación de email**, sin aprobación
  manual. El cliente verifica el correo y accede a precios y pedidos de inmediato.
  Estados de cuenta: pendiente-verificación / activo / suspendido (la suspensión
  la gestiona el admin).
- **Login / sesión** — autenticación con credenciales y recuperación de contraseña.
- **Catálogo con precios** — mismo catálogo que la zona pública, con **precio en
  USD visible** solo para usuarios autenticados.
- **Pedido (Release 1)** — el cliente selecciona productos y cantidades y crea el
  pedido. **No hay checkout ni cobro dentro de la web.** El cliente paga por su
  cuenta (transferencia, efectivo, etc.) y **sube el comprobante de pago** a su
  pedido. El admin verifica y mueve el estado.
- **Mis pedidos** — historial y estado de los pedidos del cliente.

### Estados del pedido (Release 1)
Dos estados, gestionados manualmente por el administrador:
1. **En proceso de pago** — estado inicial al crear el pedido. El cliente está
   pagando fuera de la web / ha subido su comprobante, pendiente de verificación.
2. **Disponible para entrega** — el admin confirma el cobro y mueve el pedido aquí.
   Es el **estado final** en Release 1 (no hay seguimiento logístico).

### Modelo de datos (entidades, nivel conceptual)
- **Cliente** (cuenta): razón social, contacto, email, estado, sede/ubicación,
  credenciales.
- **Producto**: nombre, línea, descripción, imagen, **precio en USD**, unidad,
  **stock/disponibilidad** (gestionado a mano por el admin). Entidad genérica
  publicada vía CRUD; el admin decide referencias y variantes al dar de alta.
- **Pedido**: cliente, líneas (producto + cantidad + precio en fecha), **estado**
  (en-proceso-de-pago / disponible-para-entrega), fecha, **comprobante de pago**
  (archivo subido por el cliente), observaciones.
- **Usuario admin**: personal de Julsa, rol distinto al cliente.

### Decisiones técnicas
- **Stack:** Frontend Next.js + TypeScript · Backend Node/NestJS · Postgres/Supabase
  con RLS.
- **Deploy / alojamiento (confirmado PO):** Vercel (Next.js) + Supabase (Postgres,
  Auth, Storage). Sin Kubernetes ni contenedores gestionados.
- **Auth:** Supabase Auth (email/contraseña + verificación de email).
- **Imágenes y comprobantes:** Supabase Storage (mismo vendor).
- **Moneda:** USD en catálogo y pedidos.

---

## 4. Criterios de aceptación

**Mínimos heredados de Perfil A (fijos):**
- Responsive (móvil, tablet, escritorio) y WCAG AA en lo esencial.
- SEO on-page en la **zona pública**: meta title/description únicos, Open Graph,
  sitemap.xml, datos estructurados básicos.
- Formulario de contacto funcional con anti-spam verificable.
- Lighthouse ≥ 90 en Performance y Accessibility (Home y página más pesada).

**Específicos de Perfil B (este proyecto):**
- **Autenticación:** registro, login y recuperación probados; contraseñas con
  hash (nunca en claro); gestión de sesión segura.
- **Autorización:** un usuario no autenticado **nunca** ve precios ni crea pedidos
  (verificable: petición directa a la API devuelve 401/403). El panel admin solo
  es accesible para rol admin.
- **Validación server-side** de todos los inputs (registro, pedido, comprobante).
- **Comprobantes de pago:** subida validada por tipo (PDF/imagen) y tamaño máximo;
  almacenamiento fuera del repo; solo el cliente dueño y el admin pueden verlos.
- **Gestión de secretos** fuera del código (env vars / gestor de secretos).
- **Suite de tests verde** y cobertura ≥ 90% antes de merge a `main`.
- **RGPD / datos personales:** consentimiento de tratamiento, encargo de
  tratamiento con el proveedor de auth, política de privacidad aprobada por el PO.
- Paleta y tipografía exactas del brief (§Estilos): Open Sans 14px, fondo
  `#F5F5F5`, texto `#333333`, botones naranja, menú negro, enlaces `#008CBA`,
  bordes `#CCCCCC`, sombras `#DDDDDD`, bloques `#FFFFFF`.

---

## 5. Puntos a escalar al Product Owner

> Resumen de lo resuelto y lo pendiente.

**Resuelto:**
- Teléfono `+53 72636260` y calle de La Habana — confirmados.
- Idiomas: solo español.
- Aprobación de clientes: auto-registro + verificación de email.
- Panel admin: sí, gestiona toda la web; usuarios = personal Julsa.
- Stock: disponibilidad real, manual desde el admin (sin ERP).
- Modelo de producto: CRUD genérico gestionado por el admin.
- Pedido (Release 1): sin checkout; comprobante subido por el cliente; estados
  manuales "En proceso de pago" → "Disponible para entrega".
- Pago online / checkout: Release 2.
- Deploy: Vercel + Supabase (confirmado PO).
- Auth: Supabase Auth. Imágenes/comprobantes: Supabase Storage.
- KPI: cuentas activas y pedidos/mes a 6 meses (confirmado PO).

**Pendiente (no bloquean la arquitectura, sí bloquean tareas concretas):**
1. **Textos legales** (aviso legal, privacidad, cookies) — el PO los aporta.
2. **"Trotman"** (Industrias del papel) — contenido pendiente de Alvaro.

---

## 6. Lista de tareas de construcción (alto nivel)

> Desglose ejecutable. En Fase 4 se parte cada una en tareas atómicas para el
> pipeline coder+validator. Orden de dependencia.

**Fase A — Cimientos (zona pública, incremental)**
1. Inicializar repo `web-julsa-industrial` desde plantilla Nortex + config OpenSpec.
2. Sistema de diseño: tokens de color/tipografía del brief, layout, cabecera y pie.
3. Zona pública: Inicio, Nosotros (con timeline y mapa de Cuba).
4. Zona pública: 4 catálogos de producto + banner recurrente.
5. Zona pública: Contacto (formulario + sedes con Google Maps).
6. SEO on-page + páginas legales.

**Fase B — Aplicación (saltar a Perfil B)**
7. Backend: modelo de datos, migraciones, RLS.
8. Auth: registro, login, recuperación, verificación de email, estados de cuenta.
9. Portal: catálogo con precios (autorización), creación de pedido, subida de
   comprobante, mis pedidos.
10. Panel admin: productos (CRUD), precios, stock, clientes, pedidos (cambio de
    estado) y vista de comprobantes.
11. Tests: unitarios, integración, e2e del flujo crítico → cobertura ≥ 90%.
12. Seguridad: validación, secretos, revisión adversarial.

**Fase C — Cierre**
13. Auditoría de accesibilidad WCAG AA y rendimiento (Lighthouse).
14. Contenido final + revisión contra esta spec.
15. Despliegue (requiere confirmación explícita del PO).

*Tareas bloqueadas por inputs pendientes: 1 (repo), 6 (textos legales).*

---

**Este documento requiere aprobación del Product Owner antes de pasar a Fase 3.**
