# Fase 3 · Diseño — Web Julsa Industrial

**Fase:** 3 · Diseño (Identidad e interfaz)
**Estado:** **Propuesta — Pendiente de aprobación del PO**
**Origen:** Spec v0.3 (Fase 2 aprobada) + `Definiciones Previas.md` (paleta/tipo) + skill `frontend-design`
**Versión:** v0.1 · Agosto 2026

> **Cómo leer esto.** La paleta y tipografía las fija el brief y se respetan
> exactamente. La libertad de diseño se gasta en **un solo signature element**
> (el mapa-red de distribución de Cuba). Las pantallas clave van con wireframe
> ASCII. Aprobado esto, se construye.

---

## 1. Sistema de tokens

### Color
Fijado por el brief. Se respeta sin desviación. El único valor que el brief no
acuñó en hex es el **naranja del botón**; se elige aquí justificado.

| Token | Hex | Uso | Origen |
|---|---|---|---|
| `--bg` | `#F5F5F5` | fondo de página | brief |
| `--surface` | `#FFFFFF` | bloques (producto, info, contacto, nosotros) | brief |
| `--text` | `#333333` | texto base | brief |
| `--ink` | `#1A1A1A` | barra de menú / cabecera ("negro") | brief |
| `--link` | `#008CBA` | enlaces | brief |
| `--border` | `#CCCCCC` | bordes | brief |
| `--shadow` | `#DDDDDD` | sombras de bloque | brief |
| `--accent` | `#E76F00` | botones / CTA / acentos (naranja energía) | **propuesta** |
| `--accent-deep` | `#B5520A` | hover / texto naranja sobre blanco a tamaño normal | **propuesta** |

**Justificación del naranja `#E76F00`:** naranja de seguridad/energía, coherente
con el mundo de Julsa (combustibles + energía solar + acero). Lee industrial, no
genérico.

**Accesibilidad del botón naranja (criterio WCAG AA):** blanco sobre `#E76F00` da
ratio ~3.2:1, que **supera el umbral de texto grande (3:1)** pero no el de texto
normal (4.5:1). Por eso los botones van con **texto en negrita ≥16px** (cualifica
como *large text*). Texto naranja a tamaño normal sobre blanco usa `--accent-deep`
(`#B5520A`, ratio ~4.4:1, borderline) o se evita a favor del `--link`.

### Tipografía
El brief fija **Open Sans** como única familia. Se respetan sus palabras: no se
introduce una segunda typeface. La jerarquía se crea con **peso y escala**, no con
familias distintas. Tamaño base **14px** (fijado por el brief).

| Rol | Peso | Tamaño | Uso |
|---|---|---|---|
| Display | ExtraBold 800 | 34–44px | titulares de hero y página |
| Heading | Bold 700 | 22–28px | títulos de bloque |
| Subhead | SemiBold 600 | 16–18px | subtítulos, etiquetas de sección |
| Body | Regular 400 | 14px | texto base (tamaño del brief) |
| Caption | Regular 400 | 12px | notas, datos legales |
| Data | SemiBold 600 | 14px | especificaciones (kW, kWh, W, USD) |

> **Detalle "data":** las especificaciones de producto (630W, 2,5–15kWh) se
> tratan como datos — SemiBold con label monoespaciado conceptual. No es decoración:
> esos números son información real del producto.

### Layout
- **Grid de 12 columnas**, max-width 1200px, gutters 24px.
- **Bloques `--surface`** (blancos) sobre fondo `--bg`, con sombra `--shadow` y
  borde sutil `--border`. Es el patrón del brief ("bloques de producto/info/...").
- **Cabecera sticky** en `--ink` con texto blanco; CTA naranja.
- **Pie** en `--ink`, texto blanco, enlaces legales.
- **Mobile-first.** Breakpoints: 640 (tablet), 1024 (escritorio).

---

## 2. Signature element — la red de distribución de Cuba

> El único elemento memorable, donde se gasta la "audacia". Justificado contra el
> mundo real de Julsa, no decorativo.

**Qué es:** un mapa SVG de Cuba con sus **5 emplazamientos reales** (La Habana,
Cienfuegos, Camagüey, Holguín, Bayamo) como nodos naranja unidos por rutas de
distribución en hairline `--border`, con un **pulso sutil** que recorre las rutas
representando el flujo de suministro.

**Por qué es el signature, no decoración:**
- Codifica **información verdadera**: la red logística real de Julsa. No es un
  marcador numerado genérico.
- Es **exclusivo de Julsa**: ninguna otra web lo tiene.
- El movimiento representa **literalmente** lo que hace la empresa (distribuir).
  Si la animación no aportara, se quita.

**Dónde vive:** sección Equipo de `/nosotros` (versión interactiva grande) y una
versión estática compacta en el bloque de contacto de la Home.

**Accesibilidad:** `prefers-reduced-motion: reduce` → el pulso se detiene, los
nodos y rutas quedan estáticos. Cada nodo tiene `aria-label` con el nombre de la
ciudad. El mapa es decorativo-interpretativo; la lista de ciudades siempre está
disponible como texto (dual encoding).

---

## 3. Wireframes de pantallas clave

### 3.1 Home (`/`) — escritorio
```
┌───────────────────────────────────────────────────────────────┐
│ [LOGO] Inicio Nosotros Combustibles Equipam. Autopartes Materias  [Acceso clientes→]│ cabecera --ink, sticky
├───────────────────────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓ HERO REEL ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                        │
│ ▓ [ ISO tanques · balitas gas · placas solares ]              │
│ ▓ Suministro industrial y energético para Cuba                │
│ ▓                              [ ACCESO CLIENTES → ] (--accent)│
├───────────────────────────────────────────────────────────────┤
│  SOBRE NOSOTROS                                                │ bloque --surface
│  Empresa española radicada en Cuba desde 2010…        Leer →  │
├───────────────────────────────────────────────────────────────┤
│  LÍNEAS DE PRODUCTO                                            │ bloque --surface
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │Combust.│ │Equipam.│ │Autopart│ │Materias│   (--surface,    │
│  │  ⚠ ico │ │  ☀ ico │ │  ◎ ico │ │  ▦ ico │    borde/sombra)│
│  └────────┘ └────────┘ └────────┘ └────────┘                  │
├───────────────────────────────────────────────────────────────┤
│  CONTACTO / SEDES  (mapa Cuba estático)                        │
│  La Habana · Madrid                          Ver contacto →    │
├───────────────────────────────────────────────────────────────┤
│ ▒▒▒▒▒▒▒▒ CTA PORTAL ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                  │ banda --accent pálido
│ ▒ Cree su usuario. Precios en USD dentro.  [ REGISTRARSE → ]  │
├───────────────────────────────────────────────────────────────┤
│ FOOTER --ink: contacto · mapa web · privacidad · cookies · portal │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 Catálogo de producto (`/equipamiento-energetico`) — escritorio
```
┌───────────────────────────────────────────────────────────────┐
│ [LOGO] …menú…                                       [Acceso clientes→]│
├───────────────────────────────────────────────────────────────┤
│  EQUIPAMIENTO ENERGÉTICO  (Display)                            │
├───────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐            │ tarjetas --surface
│  │  [foto Alvaro]       │  │  [foto Alvaro]       │            │
│  │  Placas solares      │  │  Baterías            │            │
│  │  Paneles FV bifaciales│  │  Almacenamiento     │            │
│  │  630 W   (data)      │  │  2,5–15 kWh (data)  │            │
│  └──────────────────────┘  └──────────────────────┘            │
│  ┌──────────────────────┐                                     │
│  │  [foto Alvaro]       │                                     │
│  │  Inversores          │                                     │
│  │  600 W – 10 kW (data)│                                     │
│  └──────────────────────┘                                     │
├───────────────────────────────────────────────────────────────┤
│  BANNER REGISTRO (--surface, borde --accent)                   │
│  "Para conocer en detalle los productos que suministramos,    │
│   cree un usuario y acceda a su área personal…                │
│   Anímese, entre y verifique nuestros precios en Cuba"        │
│                                   [ CREAR USUARIO → ]          │
└───────────────────────────────────────────────────────────────┘
```
> Misma estructura para `/combustibles` (iconos en vez de fotos),
> `/autopartes` y `/materias-primas`.

### 3.3 Contacto (`/contacto`) — escritorio
```
┌───────────────────────────────────────────────────────────────┐
│  CONTACTO                                                      │
│  ┌─────────────────────┐  ┌────────────────────────────┐       │
│  │ FORMULARIO          │  │ SEDES                      │       │
│  │ Nombre  [________]  │  │ ▸ La Habana                │       │
│  │ Teléf.  [________]  │  │   c/202 #1918, Siboney     │       │
│  │ Email   [________]  │  │   [ver en Google Maps →]   │       │
│  │ Mensaje [________]  │  │ ▸ Madrid                   │       │
│  │         [________]  │  │   c/Núñez de Balboa 118    │       │
│  │  (anti-spam)        │  │   [ver en Google Maps →]   │       │
│  │  [ ENVIAR ] (--accent)│ │ Tfno: +53 72636260         │       │
│  └─────────────────────┘  └────────────────────────────┘       │
└───────────────────────────────────────────────────────────────┘
```

### 3.4 Portal — Acceso clientes (`/portal/login`) y registro
```
┌───────────────────────────────────────────────────────────────┐
│                       [LOGO Julsa]                             │
│  ┌─────────────────────────────────────────┐                   │ tarjeta --surface
│  │  ACCESO CLIENTES                         │                   │ centrada, fondo --bg
│  │  Email    [_____________________]        │                   │
│  │  Clave    [_____________________]        │                   │
│  │  ¿Olvidó su clave?              (link)   │                   │
│  │  [ ENTRAR ] (--accent)                   │                   │
│  │  ─────────────────────────────           │                   │
│  │  ¿Sin cuenta? [ Crear usuario → ]        │                   │
│  └─────────────────────────────────────────┘                   │
└───────────────────────────────────────────────────────────────┘
> Registro pide: razón social, contacto, email, sede/ubicación, clave.
> Tras crear: estado "pendiente-verificación" → email de confirmación → "activo".
```

### 3.5 Portal — Detalle de producto con precio (cliente autenticado)
```
┌───────────────────────────────────────────────────────────────┐
│ [LOGO] …menú…  [Mi cuenta ▾]                                  │
├───────────────────────────────────────────────────────────────┤
│  Equipamiento › Placas solares                                 │
│  ┌────────────────┐  ┌──────────────────────────────┐          │
│  │ [foto Alvaro]  │  │ Panel FV bifacial monocrist. │          │
│  │                │  │ 630 W  (data)                │          │
│  │                │  │ Disponibilidad: EN STOCK ●   │          │
│  │                │  │ ──────────────────────────── │          │
│  │                │  │ Precio:  USD  ___  (cliente) │          │ ← precio visible solo auth
│  │                │  │ Cantidad: [  1  ]            │          │
│  │                │  │ [ AÑADIR AL PEDIDO ] accent  │          │
│  └────────────────┘  └──────────────────────────────┘          │
├───────────────────────────────────────────────────────────────┤
│  MIS PEDIDOS recientes  (mini)                                 │
└───────────────────────────────────────────────────────────────┘
```

### 3.6 Portal — Mis pedidos (estados Release 1)
```
┌───────────────────────────────────────────────────────────────┐
│  MIS PEDIDOS                                                   │
│  ┌──────────┬──────────────┬───────────────┬──────────────┐    │
│  │ Pedido   │ Fecha        │ Estado        │ Comprobante  │    │
│  ├──────────┼──────────────┼───────────────┼──────────────┤    │
│  │ #00123   │ 07-08-2026   │ ● En proceso  │ [subir/ver]  │    │ ← ámbar
│  │ #00118   │ 30-07-2026   │ ● Disponible  │ [ver]        │    │ ← verde
│  └──────────┴──────────────┴───────────────┴──────────────┘    │
└───────────────────────────────────────────────────────────────┘
> Semáforo de estados: ámbar = En proceso de pago · verde = Disponible para entrega.
```

---

## 4. Panel admin (gobierna toda la web) — wireframe alto nivel
```
┌───────────────────────────────────────────────────────────────┐
│ [Julsa Admin]  Productos · Pedidos · Clientes · Stock · Cuenta│ barra --ink
├────────────┬──────────────────────────────────────────────────┤
│ Productos  │  Gestionar productos                              │
│ Pedidos    │  [ + Nuevo producto ]                             │
│ Clientes   │  ┌──────────┬──────┬───────┬────────┬────────┐    │
│ Stock      │  │ Producto │ Línea│ Precio│ Stock  │ Acción │    │
│            │  │ …        │ …    │ USD   │ nº     │ ed/del │    │
│            │  └──────────┴──────┴───────┴────────┴────────┘    │
│            │  Pedidos: lista con [ver comprobante] y           │
│            │  selector de estado  ● En proceso → ● Disponible  │
└────────────┴──────────────────────────────────────────────────┘
> Acceso solo rol admin (personal Julsa). CRUD completo de productos,
> cambio manual de estado de pedido con vista del comprobante,
> gestión de clientes (activar/suspender), stock manual.
```

---

## 5. Restraint y calidad mínima

- **Un solo riesgo** (el mapa-red). Todo lo demás, disciplinado: grids regulares,
  bloques blancos sobre gris, tipografía Open Sans consistente.
- **Focus visible** en teclado (outline `--accent`), `prefers-reduced-motion`
  respetado (detiene el pulso del mapa), contraste AA verificado.
- **Sin animaciones dispersas.** El hero es un carrusel sobrio (auto-avance
  lento, pausa en hover), no un espectáculo.
- **Iconos de Combustibles** seleccionados por el coder: set coherente, monocromo
  `--text` o `--accent`, no mezcla de estilos.

---

## 6. Crítica propia (self-review previo a construir)

- **¿Lee como default genérico?** No: la paleta gris-blanco-naranja no es uno de
  los tres defaults AI (cream+serif+terracotta / black+acid / broadsheet), y el
  mapa-red es específico de Julsa.
- **¿Se justifica cada decisión contra el brief?** Sí: paleta/tipo/textos legales
  del brief; orange CTA y data-labels coherentes con el sector industrial.
- **Accesorios a quitar antes de salir:** ninguno añadido de más; si el pulso del
  mapa distrae en pruebas, se reduce a estático. (Regla Chanel: quitar uno.)
- **Riesgo residual:** el `--link` `#008CBA` sobre `--bg` puede leer algo
  "tech-corporativo". Se mitiga dejando que el naranja domine los CTA y
  reservando el azul solo para enlaces de texto.

---

**Este documento requiere aprobación del Product Owner antes de pasar a Fase 4.**
