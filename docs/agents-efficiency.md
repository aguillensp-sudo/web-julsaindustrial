# AGENTS.md — Reglas de eficiencia para agentes

> Documento de instrucciones para agentes de IA. Define reglas estrictas para
> minimizar el consumo de tokens y mantener sesiones productivas.
> Elaborado a partir de un caso real donde una sola tarea consumió **+6M tokens**
> por mal manejo de contexto. No repitas esos errores.
>
> **Ámbito:** escrito para agentes en entornos tipo Claude Code (con tools de
> bash, lectura de archivos, subagentes y compactación de sesión). Para agentes
> en otros entornos —por ejemplo, nodos de un grafo LangGraph— los principios
> se mantienen pero los mecanismos concretos (`/compact`, tool `Agent`) no
> existen y hay que adaptarlos. Ver §12.

---

## §1. REGLA CERO — El contexto se cobra en cada turno

**Cada respuesta reenvía TODO el historial anterior.** No pagas una vez por lo
que entra en el contexto: lo pagas en ese turno y en todos los siguientes.

El coste es **acumulativo y creciente**. Una imagen leída en el turno 3 de una
conversación de 30 turnos se ha reenviado 27 veces. Un volcado de HTML en el
turno 5 sigue ahí en el turno 25.

> **Nota sobre la aritmética.** Es tentador estimar el coste como
> "turnos × tamaño final del contexto", pero eso sobreestima: el contexto crece
> progresivamente, no arranca lleno. La suma real de una progresión creciente
> ronda la mitad de ese cálculo. Lo que importa no es la fórmula exacta sino el
> principio: **todo lo que metes, lo pagas repetidamente**, y cuanto antes lo
> metas, más veces lo pagas.

Antes de generar cualquier output, pregúntate: *¿esto infla el contexto de forma
permanente?* Si la respuesta es sí, busca una alternativa más compacta.

---

## §2. IMÁGENES — La fuente nº1 de consumo oculto

**Esta es la regla más importante del documento.** En el caso que originó estas
normas, las imágenes —no la longitud de la conversación— fueron el grueso del
consumo. Una imagen grande procesada con modelo de visión son miles de tokens,
y se reenvía en cada turno posterior.

### PROHIBIDO
- ❌ `Read` sobre imágenes para "ver qué contienen". Cada imagen grande se sube
  a CDN y se procesa con modelo de visión = **miles de tokens por imagen**,
  multiplicados por todos los turnos que queden.
- ❌ Leer imágenes originales de varios MB sin antes comprobar su tamaño.
- ❌ Volver a leer una imagen ya inspeccionada en turnos anteriores.

### OBLIGATORIO
- ✅ Para metadatos (dimensiones, formato, peso): usar `PIL` / `file` / `identify`.
  Ejemplo: `python -c "from PIL import Image; print(Image.open('x.jpg').size)"`.
- ✅ Para decidir qué imágenes leer visualmente: **máximo 1-2** por sesión, y solo
  si es estrictamente necesario para la tarea.
- ✅ Optimizar/comprimir imágenes antes de cualquier inspección visual.

---

## §2 bis. IMÁGENES ADJUNTADAS POR EL USUARIO — El riesgo que el agente no pidió

§2 cubre imágenes que **el agente** decide leer. Esta sección cubre imágenes que
**el usuario adjunta al chat** (arrastra un PNG/JPG al mensaje). No fueron decisión
del agente, pero una vez adjuntadas **viven en el contexto de cada turno siguiente**
y multiplican su coste exactamente igual que las de §2. Una sola imagen adjunta de
~2MB, codificada en base64, son cientos de miles de tokens; en una sesión de 30
turnos, **millones**. Este es el patrón que más consume en la práctica.

### REGLA DE ORO
**En cuanto el usuario adjunte una imagen de más de ~500KB, avisa al usuario y
propón cerrar sesión / abrir nueva.** No esperes a que el contexto crezca.

### OBLIGATORIO
- ✅ Comprobar el peso del adjunto si se puede (nombre, metadata del mensaje, o
  descargarlo a disco y medirlo con `PIL`/`file` en un único paso). No abrirlo
  con modelo de visión salvo que sea estrictamente necesario.
- ✅ Si el adjunto es un **asset del proyecto** (logo, hero, foto): descargarlo a
  `public/` o `_work/` con `curl`/archivo, procesarlo/optimizarlo ahí, y tratarlo
  como fichero. **No usar el adjunto como fuente recurrente de contexto.**
- ✅ Si el adjunto es un **mockup/referencia visual** que hay que imitar: inspeccionarlo
  **una sola vez** al principio, extraer la estructura a `.json`/`.md`, y a partir
  de ahí trabajar con ese texto. No mirar la imagen de nuevo en turnos sucesivos.
- ✅ Recomendar `/compact` o sesión nueva cuanto antes si la sesión ya pasó de
  ~10 turnos con la imagen dentro.

### PROHIBIDO
- ❌ Dejar una imagen de varios MB adjunta y seguir iterando 20+ turnos sin avisar
  del coste acumulado.
- ❌ Volver a referenciar o "ver" el adjunto en turnos posteriores "por si acaso".
- ❌ Llamar a herramientas de visión extra (p.ej. `analyze_image`) sobre una imagen
  que ya está adjunta: duplica el coste de visión para el mismo contenido.
- ❌ Tratar los adjuntos como "gratuitos porque los puso el usuario": no lo son. El
  agente es responsable de gestionar su propio contexto.

### CHECKPOINT RÁPIDO (antes de responder, si hay adjunto)
- [ ] ¿El adjunto pesa >500KB? → avisar al usuario y proponer sesión nueva.
- [ ] ¿Necesito ver la imagen de nuevo este turno, o ya extraje lo que hace falta?
  → no volver a mirarla.
- [ ] ¿Puedo descargar el adjunto a disco y trabajar con metadatos? → hacerlo.

---

## §3. OUTPUTS DE BASH — Compactos siempre

### PROHIBIDO
- ❌ `cat archivo.html`, `head -200 archivo`, o volcados completos de archivos grandes.
- ❌ Mostrar el output entero de un comando para "ver qué pasa".
- ❌ Repetir el mismo dump en turnos sucesivos.

### OBLIGATORIO
- ✅ `grep -c patrón archivo` en vez de `cat | grep | wc`.
- ✅ `wc -l` / `du -sh` para confirmar tamaño sin ver contenido.
- ✅ Limitar con `head -n 20` o `tail -n 10` cuando necesites ver algo concreto.
- ✅ Procesar datos con scripts que devuelvan **solo el resultado**, no el
  dataset completo. Ejemplo: extraer y guardar a `.json`, luego imprimir un
  resumen de 5 líneas.

---

## §4. DELEGACIÓN — Usa el tool `Agent`

Para tareas de búsqueda o análisis que impliquen leer muchos archivos:

- ✅ Usar `Agent` (subagente) para que lea y devuelva **solo la conclusión**.
  Su consumo no contamina el contexto principal de forma permanente.
- ✅ Especialmente útil para: encontrar un símbolo en una codebase, auditar
  múltiples archivos, extraer datos estructurados de HTML/XML grandes.

### Cuándo NO delegar
- Búsquedas de un único hecho que ya sabes dónde está → hazlo directo.

---

## §5. CONTEXTO — Mantenlo limpio

### PROHIBIDO
- ❌ Alargar una conversación que ya cumplió su objetivo.
- ❌ Repetir información que ya está en turnos anteriores "por si acaso".

### OBLIGATORIO
- ✅ Cuando una tarea termine, **recomendar al usuario empezar sesión nueva**
  para la siguiente tarea. El contexto no se transmite gratis.
- ✅ Si la conversación crece mucho, usar `/compact` o indicar al usuario que
  el resumen automático está activo.
- ✅ Prefiere escribir resultados a archivos (`.json`, `.md`) y referenciarlos
  por ruta, en vez de pegarlos en el chat.

---

## §6. WORKFLOW DE EXTRACCIÓN WEB (caso específico)

Cuando extraigas contenido de una URL para replicarlo o migrarlo:

1. **Descargar** HTML y assets a una carpeta `_source/` con `curl` (un comando,
   output mínimo).
2. **Parsear** con un script que extraiga texto/estructura a `.json` o `.md`.
   Imprimir solo un resumen (ej: "13 páginas, 72 marcas extraídas").
3. **NO** mostrar el HTML crudo ni el contenido completo en el chat.
4. **Construir** los archivos de destino leyendo los `.json`, no releyendo HTML.
5. **`_source/` se excluye del commit** con `.gitignore`.

> **Nota legal.** Extraer contenido de una web de terceros para replicarla puede
> vulnerar derechos de autor y los términos de uso del sitio. Antes de hacerlo,
> confirmar con el Product Owner que existe autorización del titular. Que sea
> técnicamente posible no lo hace legítimo.

---

## §7. COMMITS Y GIT — Output silencioso

### PROHIBIDO
- ❌ Mostrar el listado completo de `git commit` con los 130 archivos
  (`create mode 100644 ...` por cada uno = mucho output inútil).

### OBLIGATORIO
- ✅ Tras `git commit`, mostrar solo: `git log --oneline -1`.
- ✅ Para `git add`, comprobar con `git status --short | wc -l` (un número).
- ✅ `git diff --stat | tail -1` para ver totales, no el diff completo.

---

## §8. CHECKPOINT ANTES DE RESPONDER

Antes de enviar cualquier respuesta, verificar mentalmente:

- [ ] ¿Estoy a punto de pegar >50 líneas de output? → reducir.
- [ ] ¿Estoy a punto de leer una imagen >1MB? → usar metadatos en su lugar.
- [ ] **¿Hay una imagen adjunta por el usuario de >500KB en el contexto? →
      avisar del coste y proponer sesión nueva (ver §2 bis).**
- [ ] ¿Estoy repitiendo información de turnos anteriores? → eliminar.
- [ ] ¿Puede esta subtarea delegarse a un `Agent`? → delegar.
- [ ] ¿Terminó la tarea? → sugerir nueva sesión al usuario.

---

## §9. CASO DE ESTUDIO — Lo que NO hay que hacer

**Escenario:** replicar un sitio web con nuevo diseño.

**Consumo real: +6M tokens.** Causas, por orden de peso:

1. **Lectura visual de 6 imágenes originales de ~4MB** para "ver qué eran".
   Miles de tokens cada una, reenviadas en todos los turnos siguientes.
   **Esta fue la causa principal.**
2. Volcados de HTML descargado mostrados en el chat, página por página.
3. Script imprimiendo las 141 rutas de imágenes encontradas.
4. Re-lectura del mismo HTML en varios turnos para extraer datos distintos.
5. Output completo de `git commit` con 130 líneas `create mode`.
6. Conversación de 30+ turnos, que multiplicó el coste de todo lo anterior.

> **La lección correcta:** el problema no fue "hablar mucho", fue **meter
> binarios pesados y volcados grandes en un contexto que luego se reenvió
> decenas de veces**. Una conversación larga con contexto limpio es barata;
> una corta con tres imágenes de 4MB no lo es.

**Lo correcto habría sido:**
1. Inspeccionar imágenes con `PIL` (metadatos) → ~200 tokens.
2. Parsear HTML con script que guarda a `.json` e imprime 3 líneas → ~500 tokens.
3. Delegar la extracción de datos a un `Agent` → no contamina contexto principal.
4. Commit silencioso: `git log --oneline -1` → ~50 tokens.
5. Al terminar el build, sugerir sesión nueva.

**Ahorro estimado:** ~70-80% del consumo real.

---

## §9 bis. CASO DE ESTUDIO nº2 — Imágenes adjuntadas por el usuario (2026-07)

**Escenario:** construcción de la web de Nortex Systems (Perfil A, escaparate),
fase de diseño. Sesión de ~50 turnos en la que se maquetó la Home y se iteró el
bloque hero.

**Consumo real: 18,4 millones de tokens** (medido en el medidor de la plataforma,
no estimado).

### Causas, por orden de peso

1. **El usuario adjuntó 2 imágenes PNG de ~1,9MB cada una** (hero en español y en
   inglés) para integrarlas en la web. Codificadas en base64 dentro del cuerpo de
   la petición, suponen cientos de miles de tokens **cada una**. **Causa principal.**
2. **La sesión siguió ~30 turnos más con esas imágenes dentro del contexto.**
   Cada turno reenvió los cientos de miles de tokens de los adjuntos. Iteraciones
   de tuneo del hero (texto → imagen, marcos, tamaños, layout) multiplicaron el
   coste de los adjuntos.
3. **Bucle de reinicios del servidor de desarrollo** (~10-15 turnos peleando con
   `next dev`, `EADDRINUSE`, procesos zombie). Turnos baratos por sí mismos, pero
   **cada uno amplificó el coste de las imágenes adjuntas** que arrastraba.
4. **Un pase de visión redundante:** se llamó a `analyze_image` sobre el hero
   cuando la imagen ya estaba adjunta, duplicando el coste de visión en ese tramo.

> **Por qué §2 no lo frenó.** §2 cubre imágenes que el *agente* decide leer con
> `Read`. Aquí las imágenes las adjuntó el *usuario* y permanecieron vivas en el
> historial sin que el agente hiciera nada. Ese caso no estaba cubierto → ver §2 bis.

**Lo correcto habría sido:**
1. En cuanto llegó el primer adjunto de 1,9MB, descargarlo a `public/` con
   `curl`/archivo, optimizarlo a WebP y dejar de referenciar el adjunto → cientos
   de miles de tokens entraban **una sola vez**, no en cada turno.
2. Avisar al usuario del coste acumulado y proponer sesión nueva al detectar que
   se llevaban >10 turnos con el adjunto dentro.
3. No llamar a `analyze_image` sobre una imagen ya adjunta.
4. Tras la primera iteración del hero, cerrar sesión y reanudar en una nueva.

**Ahorro estimado:** ~80-90% del consumo real (≈15M de tokens) si se hubiera
descargado el adjunto y trabajado como fichero, y cortado la sesión a los ~10
turnos. **La regla que lo habría evitado es §2 bis**, añadida a este documento
tras este incidente.

---

## §10. MÉTRICA PERSONAL

Si en una sesión sientes que el contexto está creciendo mucho, para y aplica:

```
¿Llevo más de 15 turnos en la misma tarea?    → considerar /compact o nueva sesión
¿Hay imágenes/HTML pegado en el historial?     → ya es tarde, compactar
¿Voy a leer más archivos grandes?              → delegar a Agent
```

La eficiencia no es opcional. Cada token tiene coste.

---

## §11. REPORTE DE CONSUMO — Obligatorio al cerrar tarea

Las reglas anteriores evitan meter basura en el contexto, pero **no dan
visibilidad**. Un agente disciplinado puede seguir consumiendo mucho sin que
nadie se entere hasta que llega la factura.

Por eso: **al terminar una tarea, antes de cerrar, reporta al usuario un
resumen del trabajo realizado.**

Formato mínimo:

```
Resumen de sesión
- Turnos: N
- Archivos leídos: N (los pesados, nombrados)
- Imágenes procesadas visualmente: N
- Outputs grandes generados: N
- Desviaciones: [cualquier cosa que se salió de lo previsto]
```

**No inventes cifras de tokens.** No tienes acceso al medidor de la plataforma;
decir "he consumido X tokens" sería fabricar un dato. Reporta lo que sí sabes:
qué hiciste, cuántos archivos tocaste, qué fue pesado. Si algo se descontroló,
dilo explícitamente en vez de esperar a que el usuario lo descubra.

Este reporte es la entrada del control de costes por proyecto. Sin él, el gasto
solo se detecta a posteriori.

---

## §12. ADAPTACIÓN A OTROS ENTORNOS

Este documento asume un entorno con sesión conversacional, tools de bash,
subagentes y compactación. Si el agente corre en otro contexto:

**En un grafo (LangGraph o similar):**
- No hay `/compact` ni sesión que reiniciar → el control está en qué se pasa
  entre nodos. Pasa referencias (rutas de archivo, IDs), no contenidos.
- No hay tool `Agent` → la delegación es un nodo separado del grafo, con su
  propio estado, que devuelve solo la conclusión al estado compartido.
- El `SharedContext` entre nodos es el equivalente al historial: mantenlo
  mínimo y estructurado, nunca un volcado.

**Principios que se mantienen en cualquier entorno:**
1. No metas binarios ni volcados grandes en lo que se propaga.
2. Trabaja con referencias y resúmenes, no con contenidos completos.
3. Delega lo pesado a un ámbito aislado que devuelva solo el resultado.
4. Reporta lo que has consumido al terminar.
