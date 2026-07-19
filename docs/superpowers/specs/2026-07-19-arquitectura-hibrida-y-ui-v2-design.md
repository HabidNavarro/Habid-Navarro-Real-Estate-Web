# Diseño: Arquitectura híbrida Cloudflare + miniserver y actualización de UI a v2

Fecha: 2026-07-19

## Contexto

- El sitio actual es Astro 5 estático, publicado en Cloudflare Pages (proyecto `habidnavarro`, dominio habidnavarro.com) mediante subida directa con wrangler. NO hay conexión git-deploy: `git push` no actualiza producción.
- Hoy no existe backend: sin base de datos, sin API, sin almacenamiento de formularios. El formulario de contacto solo arma un mensaje de WhatsApp.
- Existe un rediseño v2 (carpeta `habid-navarro-redesign-v2` en Downloads): HTML/CSS/JS estático generado con `build.py` a partir de `data/site.json` y `data/properties.json`, con el mismo contenido (6 propiedades) y una UI más moderna (filtros, lightbox, FAQ, formulario).
- El usuario tiene un miniserver Linux con Docker y un Cloudflare Tunnel ya activo.

## Objetivos

1. Actualizar la UI del sitio al diseño v2 conservando el motor Astro (enfoque aprobado: portar el v2 a Astro).
2. Cloudflare autosuficiente: si el miniserver cae, el sitio conserva todas las funcionalidades básicas y ningún lead se pierde.
3. Miniserver como capa opcional: CMS para editar y publicar, dashboard de métricas de leads, respaldo del código y originales de fotos a tamaño completo.

## No objetivos

- SSR o contenido dinámico servido en producción (se descartó el enfoque C por complejidad innecesaria).
- Notificaciones inmediatas de leads (decisión explícita del usuario: los leads se consultan en el dashboard y en D1).
- Autenticación de visitantes en el sitio público.
- Migrar el hosting del sitio fuera de Cloudflare.

## Decisiones tomadas con el usuario

1. Backend en miniserver: panel admin/CMS y captura de leads, con Cloudflare como cara pública autosuficiente.
2. Acceso al miniserver: Cloudflare Tunnel (ya configurado).
3. Leads resilientes: Pages Function + D1 en Cloudflare; el miniserver sincroniza cuando está vivo.
4. Ambiente del miniserver: Linux con Docker (todo en contenedores).
5. Stack del sitio: enfoque A, portar el diseño v2 al proyecto Astro actual con datos en JSON.
6. Sin notificación inmediata de leads.

## Arquitectura

Dos capas:

**Cloudflare (siempre disponible, plan gratuito):**

- Pages sirve el sitio estático con el diseño v2.
- Pages Function `POST /api/lead` guarda leads en D1.
- Endpoint `GET /api/leads` protegido con token para sincronización.
- Web Analytics (script sin cookies) para métricas de tráfico.

**Miniserver (opcional, Docker detrás del Tunnel):**

- CMS web: edita `data/*.json` y fotos, publica con un botón.
- Job de sincronización de leads: D1 hacia SQLite local, alimenta el dashboard.
- Espejo git del repo de GitHub (respaldo de código e historial).
- Volumen con originales de fotos a tamaño completo.

## Componentes

### 1. Sitio (repo actual, Astro 5)

- Los datos se mueven a `data/site.json` y `data/properties.json` en la raíz del repo, con la misma estructura del v2, para que el CMS los edite sin tocar código. Astro los importa directamente; `src/data/*.ts` se elimina o queda como wrapper tipado delgado sobre los JSON.
- Componentes re-maquetados con el HTML/CSS/JS del v2: Nav, Hero, PropertyCard, Gallery (lightbox con teclado), filtros y búsqueda del catálogo, FAQ, formulario de contacto, Footer, badges de estado, CTA de WhatsApp.
- `src/styles/global.css` se reemplaza por el sistema visual del v2 (`assets/css/styles.css`).
- Rutas sin cambios: `/`, `/propiedades`, `/propiedades/[slug]`, `/contacto`, `/sobre-mi` (sigue oculta del menú), `/aviso-de-privacidad`, `404`. Coinciden con las del v2.
- Se conservan: componente SEO, sitemap automático de `@astrojs/sitemap`, robots, favicon y metadatos sociales del v2.

### 2. Captura de leads (Cloudflare)

- `functions/api/lead.ts` (Pages Functions) con binding a una base D1.
- Tabla `leads`: `id`, `created_at`, `nombre`, `contacto` (teléfono o email), `mensaje`, `propiedad_slug`, `fuente`, `user_agent`.
- Validación: `nombre` y `contacto` requeridos, límites de longitud, campo honeypot antispam.
- El formulario del sitio hace POST a `/api/lead`, muestra confirmación y conserva el botón de WhatsApp como canal paralelo. Si el POST falla, el usuario ve un mensaje y el enlace de WhatsApp con el texto ya armado (fallback sin servidor).
- `GET /api/leads?since=<timestamp>` responde leads incrementales; requiere header con token secreto (variable de entorno del proyecto Pages). Sin token válido responde 401.

### 3. CMS y publicación (miniserver)

- App web ligera en contenedor Docker. Runtime: Node, el mismo que ya necesita el build de Astro, para mantener un solo runtime en la imagen; el framework ligero concreto se elige en el plan de implementación. Requisitos funcionales:
  - Formularios para editar `data/site.json` y `data/properties.json` con validación de esquema antes de guardar.
  - Subida de fotos: el original se guarda a tamaño completo en el volumen `/storage/originals`; se generan las versiones optimizadas para web que van al repo.
  - Botón Publicar: `git commit` + `git push` a GitHub + `astro build` + `wrangler pages deploy dist --project-name habidnavarro`. Usa un API token de Cloudflare (permiso Pages write) y credencial de GitHub, ambos como secretos del contenedor; sin logins interactivos.
  - Dashboard de leads: lista, búsqueda y conteos por periodo y por propiedad, leyendo del SQLite local.
- Acceso protegido con Cloudflare Access sobre el Tunnel existente (login con la cuenta Google del usuario).
- La publicación manual desde la PC sigue funcionando con el mismo comando wrangler de siempre.

### 4. Sincronización y respaldos

- Cron dentro del stack Docker: cada 5 minutos (configurable) llama a `GET /api/leads?since=` con el último timestamp local e inserta lo nuevo en SQLite.
- Cron diario de espejo git: `git fetch` hacia un bare repo local del miniserver.
- Los leads quedan duplicados por diseño: D1 (Cloudflare) y SQLite (miniserver).
- El volumen `/storage/originals` entra en la rutina de respaldo general del miniserver.

## Flujo de datos

1. Visitante envía el formulario: POST `/api/lead`, la Function valida y guarda en D1, el sitio confirma.
2. El miniserver sincroniza leads incrementales cada 5 minutos cuando está vivo; al revivir tras una caída se pone al día automáticamente con `since`.
3. Edición de contenido: el CMS modifica JSON o fotos y publica; Pages actualiza el sitio de forma atómica (si el build falla, producción no cambia).
4. Métricas: tráfico en Cloudflare Web Analytics; leads en el dashboard del miniserver.

## Manejo de errores y degradación

| Falla | Efecto | Mitigación |
|---|---|---|
| Miniserver caído | CMS y dashboard offline | Sitio y captura de leads intactos; el cron se pone al día al volver |
| Function o D1 con error | El POST del formulario falla | El sitio muestra el enlace de WhatsApp con el mensaje armado |
| Build o deploy falla desde el CMS | No se publica | El CMS muestra el error; producción queda en la versión anterior |
| Token de sync inválido o rotado | Sync falla con 401 | El cron registra el error; se repara rotando el secreto en ambos lados |

## Pruebas

- Se mantienen los tests actuales (`astro build` + `node --test tests/site.test.mjs`) y se actualizan al nuevo HTML.
- Nuevo test de esquema: valida la estructura de `data/*.json`; un JSON malformado rompe el build antes de llegar a producción.
- Tests del endpoint de leads en local con `wrangler pages dev`: alta correcta, validaciones, honeypot, 401 sin token en `/api/leads`.
- Smoke test del flujo de publicación del CMS contra un branch de preview de Pages antes de usarlo en producción.

## Fases sugeridas de implementación

1. **UI v2 en Astro**: portar diseño y mover datos a JSON. Entregable visible; se publica con el flujo actual.
2. **Leads**: D1 + Function + formulario + endpoint de sync.
3. **Miniserver**: CMS, dashboard, cron de sync y publicación desde Docker.
4. **Endurecimiento**: Cloudflare Access, espejo git, respaldos, rotación de tokens.

Cada fase deja el sitio en un estado publicable y funcional por sí mismo.
