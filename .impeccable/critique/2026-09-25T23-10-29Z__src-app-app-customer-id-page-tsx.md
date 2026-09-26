---
target: customer/[id]/page.tsx
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/daniel/Documents/PROJECTS KARIMNOT/CHILLI GUALIJI/chilli-frontend/src/app/(app)/customer/[id]/page.tsx"
target_fingerprint: "sha256:a9df273a801a04abe3d811595b9063a89f53bceee120c7f507cd313de58c1bd5"
target_path: /Users/daniel/Documents/PROJECTS KARIMNOT/CHILLI GUALIJI/chilli-frontend/src/app/(app)/customer/[id]/page.tsx
timestamp: 2026-09-25T23-10-29Z
slug: src-app-app-customer-id-page-tsx
closed: true
---
# Critique — `src/app/(app)/customer/[id]/page.tsx`

Method: dual-agent (A: ses_f252cf4e0ffen1n5nJ0wv2Fcuk · B: ses_f252cf4d6ffeKB7PukcJah2fa4)

## Design Health Score (Nielsen, Operate surface)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Cascada customer→tickets/casos sin skeleton visible en código; conteos y pills sí comunican |
| 2 | Match System / Real World | 3 | ES/MXN/fechas es-MX bien; chip `Cliente · a1b2c3d4` y `?search=` son lenguaje de sistema |
| 3 | User Control and Freedom | 2 | Back-link y Ver todos existen; la fila lleva a búsqueda, sin salida clara si hay 0 resultados |
| 4 | Consistency and Standards | 3 | Mismo header/tabla/pill que listas; detalle solo-lectura sin sort/paginación como las listas |
| 5 | Error Prevention | 2 | Guardia `invoice==null→Sin factura`, truncate+title; primera columna enlazada indistinguible |
| 6 | Recognition Rather Than Recall | 1 | Entender una fila exige saltar de página; al volver solo hay un id truncado, no el nombre |
| 7 | Flexibility and Efficiency | 1 | Sin ordenar/filtrar/paginar in situ; cada fila cuesta un salto de búsqueda |
| 8 | Aesthetic and Minimalist Design | 3 | Superficie magra (2 campos + 2 tablas); doble chrome idéntico y 5 columnas siempre expandidas |
| 9 | Error Recovery | 2 | ListError+Reintentar por sección, 401→login, 404→notFound; reintentar recarga URL completa |
| 10 | Help and Documentation | 1 | Nada explica validado→facturable→facturado, qué hacer ante Sin factura o SLA vencido |
| **Total** | | **20/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Intercambiable con acentos autorales, no autoral estructural. Alta coherencia con el sistema lista (mismo PageHeader title-uppercase + accent font-marker guajillo, cards `elevacion rounded-2xl border-carbon/10 bg-tiza`, pills ES de CellValue, ListError por sección). Las dos sub-secciones son el mismo RecordList con distinto título/columnas; el perfil es un `dl` genérico de 2 campos. Lo autoral real: voz `marchantitx` en empties, acento fijo del header, MXN/es-MX, SLA relativo ("vence hoy / vencido hace X d"). Carácter perdido: acento estático aun sin nombre, sin resumen ejecutivo (¿facturable? ¿casos abiertos? ¿próximo SLA?), empties sin acción, "Sin factura" apagado en vez de momento diseñado, tablas idénticas a listas en lugar de vista-resumen del detalle.

**Deterministic scan:** `impeccable detect --json` sobre los 6 targets devolvió `[]` (exit 0, limpio). Nada mecánico que la revisión hubiera pasado por alto; ningún falso positivo que descontar en targets. Nota: el `thead bg-[#faf6ec]` hardcodeado y `border-carbon/8` que la revisión observa no los marca el detector — acuerdo parcial, el detector no cubre tokens.

**Visual overlays:** Sin overlay fiable en targets. Las rutas `/ticket`, `/case`, `/customer/test-id` redirigen a `/login` por guard de auth (sin credenciales), así que la inyección multi-view se saltó con motivo concreto en vez de fingirse. La inyección sí funcionó en `/login` (no-target): 1 banner `CREAM / BEIGE PALETTE` sobre `rgb(255,251,241)` confirmado por DOM + `window.impeccableDetect()` + screenshot. No se atribuye a los targets.

## Overall Impression

Esqueleto sólido y resiliente (fallos aislados por sección, localización de celda bien resuelta, consistencia con listas) que responde "qué existe" pero no "qué sigue": cada fila cuesta un salto de búsqueda, el riesgo (Sin factura, SLA vencido) se ve igual que un dato neutro, y los vacíos encantan pero no guían. La mayor oportunidad: convertir cada fila en una puerta y coronar el detalle con un resumen ejecutivo.

## What's Working

1. **Aislamiento de fallos por sección.** Cliente, tickets y casos fallan y se reintentan por separado; un error de casos no esconde los tickets.
2. **Localización de celda (`cell-value.tsx`).** MXN es-MX, fechas es-MX, SLA relativo con fecha absoluta en `title`, pills ES — escaneo rápido sin parsear ISO.
3. **Consistencia con las listas.** Mismo header/tabla/pill que `ticket/page` y `case/page`; quien usa las listas sabe leer el detalle.

## Priority Issues

- **[P1] Navegación por fila vía `?search=` con affordance invisible.** *What:* solo `colIndex===0` enlaza con el mismo estilo que celdas planas; factura enlaza por `ticketKey` derivado. *Why it matters:* en Operate cada clic es una tarea; aterrizar en una búsqueda rompe la expectativa y puede dar cero resultados. *Fix:* rutas de detalle reales (`/ticket/[folio]`, `/case/[folio]`, `/invoice/[id]`) o mínimo columna "Ver" + subrayado + `?from=/customer/[id]` con nombre. *Suggested command:* `/impeccable clarify`
- **[P1] Sin resumen ejecutivo.** *What:* para "¿puede facturarse? ¿hay casos abiertos? ¿qué SLA urge?" hay que escanear dos tablas completas. *Why it matters:* es la pregunta #1 de un detalle admin; hoy cuesta O(N) lectura tabular. *Fix:* tira-resumen (facturables, monto pendiente, abiertos, próximo SLA) reusando CellValue; tablas como evidencia debajo. *Suggested command:* `/impeccable shape`
- **[P1] "Sin factura" y SLA vencido sin severidad.** *What:* gris plano y relativo sin color aunque `toneFor` existe. *Why it matters:* el riesgo se ve igual que un dato neutro. *Fix:* pill neutra vs alerta accionable según facturabilidad; aplicar tono/peso a vencido/vence hoy y mostrar asignado. *Suggested command:* `/impeccable colorize`
- **[P2] Empties sin salida.** *What:* voz marker sin CTA. *Why it matters:* el momento cero-datos es el mejor para enseñar el siguiente paso. *Fix:* acción secundaria (cómo se crea / link prefiltrado) manteniendo la voz. *Suggested command:* `/impeccable onboard`
- **[P2] Asimetría detalle→lista.** *What:* el filtro llega como `Cliente · {id.slice(0,8)}`. *Why it matters:* se pierde el nombre al cruzar superficies. *Fix:* propagar nombre/teléfono (`customerName`) y chip humano en listas. *Suggested command:* `/impeccable polish`

## Persona Red Flags (Alex, Sam, Casey)

**Alex (Power User):** Sin sort/filter/paginación in situ; auditoría de N tickets exige Ver todos + re-buscar + volver; enlace por `?search=` añade un salto por fila; sin atajos ni bulk; "facturables pendientes" se escanea lineal.

**Sam (a11y):** `max-w-56 truncate` con info completa solo en `title` (inaccesible por teclado/táctil); enlaces indistinguibles (solo hover:underline, texto 11px uppercase); pill-dentro-de-Link en factura (foco anidado); tabla `min-w-[560px]` con scroll horizontal (riesgo trampa de teclado, encabezados perdidos); marker decorativa en mensajes clave.

**Casey (mobile):** Dos tablas `min-w-[560px]` + overflow-x obligan scroll horizontal; truncate corta folio/descripción donde más se necesita; BackLink/Ver todos en text-xs (blancos pequeños); scroll vertical largo sin resumen previo.

## Minor Observations

- `accent="marchantitx"` fijo aun con `title=phone` ("Sin nombre registrado" suena a marca, no a cliente).
- `thead bg-[#faf6ec]` fuera de tokens; `border-carbon/8` no estándar.
- `key={record.id ?? i}` con fallback a índice.
- Fila sin `rowHref` indistinguible de fila con enlace.
- Columna "Factura" renderiza estado, no folio/monto — confunde qué se ve.
- `←`/`→` como caracteres crudos.
- Chip de retorno deshumaniza (`Cliente · a1b2c3d4`).

## Questions to Consider

- Si el detalle respondiera una sola pregunta ("¿qué sigue: facturar, escalar o nada?"), ¿sobrevivirían las dos tablas completas o bastaría resumen + evidencia?
- ¿A quién tranquiliza "Sin factura" en gris — al admin que factura o al sistema que no quiso decidir si es problema?
- ¿Qué celebra al cliente el acento fijo "marchantitx" cuando ni tiene nombre registrado?
- Si cada clic cuesta un salto de búsqueda, ¿es esta página un destino Operate o solo una antesala de las listas?
