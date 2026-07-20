# Fase 1: UI v2 en Astro. Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar el diseño v2 (HTML/CSS/JS generado por build.py) al proyecto Astro actual, moviendo los datos a JSON editables por el futuro CMS, sin perder tests, sitemap ni SEO.

**Architecture:** El sitio sigue siendo Astro 5 estático. Las plantillas de `build.py` del v2 se traducen a componentes y páginas Astro con rutas absolutas. Los datos viven en `data/site.json` y `data/properties.json` (estructura del v2) con un wrapper tipado `src/data/content.ts`. El CSS y el JS del v2 se copian casi literales (`src/styles/global.css` y `public/js/app.js`).

**Tech Stack:** Astro 5, @astrojs/sitemap, node:test. Sin dependencias nuevas.

## Global Constraints

- PROHIBIDO el guion largo (U+2014) en todo copy visible, datos y documentos. Donde el v2 lo usa, se sustituye por coma, `·` o punto. Un test lo hace cumplir en Task 5.
- Node 20 (ya fijado en `.node-version`).
- `/sobre-mi` existe pero NO se enlaza en nav ni footer y sigue excluida del sitemap (filtro ya presente en `astro.config.mjs`, no tocar).
- Rutas absolutas (`/propiedades`, `/img/...`); el v2 usa rutas relativas con prefijo y NO se copian tal cual.
- Fuente del diseño: `C:\Users\ANGEL\Downloads\habid-navarro-redesign-v2\habid-navarro-redesign-v2`. En comandos bash se abrevia `V2="/c/Users/ANGEL/Downloads/habid-navarro-redesign-v2/habid-navarro-redesign-v2"`.
- Producción NO cambia durante la fase: los commits intermedios no se despliegan. El estado entre Task 2 y Task 4 compila y pasa tests pero mezcla visuales; solo el final de Task 5 se despliega (a branch preview).
- El formulario de contacto conserva el comportamiento v2 (abre WhatsApp, no envía a servidor). La Fase 2 lo conectará a `/api/lead`.
- Números y textos de contacto vienen SIEMPRE de `data/site.json`, nunca hardcodeados en componentes.

---

### Task 1: Datos en JSON + wrapper tipado + tests de datos

**Files:**
- Create: `data/site.json`
- Create: `data/properties.json` (copiado del v2 con rutas de imagen ajustadas)
- Create: `src/data/content.ts`
- Test: `tests/data.test.mjs`
- Modify: `package.json` (script test corre todo `tests/`)

**Interfaces:**
- Consumes: nada de tareas previas.
- Produces (todo lo que las Tasks 2 a 4 importan desde `../data/content` o `../../data/content`):
  - `site`: objeto con `name, brand, tagline, phone, phone_display, whatsapp, whatsapp_default_message, email, instagram, instagram_handle, facebook, service_area, site_url` (todos string).
  - `properties: Property[]` y `interface Property { slug; name; status; status_key: 'venta'|'apartada'|'vendida'; collection: 'disponible'|'referencia'; featured: boolean; type; bedrooms; bathrooms; price; area; location; municipality; state; summary; description: string[]; amenities: string[]; images: string[]; map_query }`.
  - `featured: Property` (la única con `featured: true`).
  - `nav: { href: string; label: string }[]` (Inicio, Propiedades, Contacto).
  - `waLink(message?: string): string` (URL wa.me; default `site.whatsapp_default_message`).
  - `cardImage(p: Property): string` (primera imagen o `/img/ui/no-photo.svg`).

- [ ] **Step 1: Escribir el test de datos (fallará porque los JSON no existen)**

Crear `tests/data.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = (p) => new URL(`../${p}`, import.meta.url);
const site = JSON.parse(readFileSync(root('data/site.json'), 'utf8'));
const properties = JSON.parse(readFileSync(root('data/properties.json'), 'utf8'));

test('site.json: campos requeridos no vacíos', () => {
  const required = ['name', 'brand', 'tagline', 'phone', 'phone_display', 'whatsapp',
    'whatsapp_default_message', 'email', 'instagram', 'instagram_handle', 'service_area', 'site_url'];
  for (const key of required) {
    assert.equal(typeof site[key], 'string', `site.json: "${key}" debe ser string`);
    assert.ok(site[key].length > 0, `site.json: "${key}" está vacío`);
  }
  assert.equal(typeof site.facebook, 'string', 'site.json: "facebook" debe ser string (puede ir vacío)');
});

test('properties.json: estructura de cada propiedad', () => {
  assert.ok(Array.isArray(properties) && properties.length > 0, 'debe haber propiedades');
  const stringFields = ['slug', 'name', 'status', 'status_key', 'collection', 'type', 'bedrooms',
    'bathrooms', 'price', 'area', 'location', 'municipality', 'state', 'summary'];
  for (const p of properties) {
    for (const key of stringFields) {
      assert.equal(typeof p[key], 'string', `${p.slug ?? '?'}: "${key}" debe ser string`);
    }
    assert.equal(typeof p.featured, 'boolean', `${p.slug}: "featured" debe ser boolean`);
    for (const key of ['description', 'amenities', 'images']) {
      assert.ok(Array.isArray(p[key]), `${p.slug}: "${key}" debe ser lista`);
    }
    assert.ok(['venta', 'apartada', 'vendida'].includes(p.status_key), `${p.slug}: status_key inválido`);
    assert.ok(['disponible', 'referencia'].includes(p.collection), `${p.slug}: collection inválida`);
    assert.equal(typeof p.map_query, 'string', `${p.slug}: "map_query" debe ser string`);
    for (const img of p.images) {
      assert.ok(img.startsWith('/img/'), `${p.slug}: imagen "${img}" debe iniciar con /img/`);
    }
  }
});

test('exactamente una propiedad destacada y con 2+ fotos', () => {
  const destacadas = properties.filter((p) => p.featured);
  assert.equal(destacadas.length, 1, 'debe haber exactamente una featured');
  assert.ok(destacadas[0].images.length >= 2, 'la destacada necesita 2+ fotos (hero y bloque destacado)');
});

test('slugs únicos', () => {
  const slugs = properties.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('sin guiones largos en los datos', () => {
  const raw = readFileSync(root('data/site.json'), 'utf8')
    + readFileSync(root('data/properties.json'), 'utf8');
  assert.ok(!raw.includes(String.fromCharCode(0x2014)), 'los datos no deben contener guiones largos');
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `node --test tests/data.test.mjs`
Expected: FAIL con `ENOENT ... data/site.json` (los JSON no existen todavía).

- [ ] **Step 3: Crear los JSON**

Crear `data/site.json`:

```json
{
  "name": "Habid Navarro",
  "brand": "Habid Navarro Bienes Raíces",
  "tagline": "Asesoría inmobiliaria honesta en Jalisco",
  "phone": "+523921075791",
  "phone_display": "+52 392 107 5791",
  "whatsapp": "523921075791",
  "whatsapp_default_message": "Hola Habid, quisiera recibir asesoría inmobiliaria.",
  "email": "habid.realestate@gmail.com",
  "instagram": "https://instagram.com/habid.realestate",
  "instagram_handle": "@habid.realestate",
  "facebook": "",
  "service_area": "Jalisco",
  "site_url": "https://habidnavarro.com"
}
```

Copiar y ajustar `data/properties.json` (bash):

```bash
V2="/c/Users/ANGEL/Downloads/habid-navarro-redesign-v2/habid-navarro-redesign-v2"
mkdir -p data
cp "$V2/data/properties.json" data/properties.json
sed -i 's|"assets/img/|"/img/|g' data/properties.json
grep -c '"/img/' data/properties.json
```

Expected: el `grep -c` imprime un número mayor a 20 (todas las rutas de imagen quedaron absolutas). Si quedaran guiones largos (U+2014) en los datos, sustituirlos por coma o `·` (el test de datos del Step 1 lo detecta al correr de nuevo).

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `node --test tests/data.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Crear el wrapper tipado**

Crear `src/data/content.ts`:

```ts
import siteJson from '../../data/site.json';
import propertiesJson from '../../data/properties.json';

export interface Property {
  slug: string;
  name: string;
  status: string;
  status_key: 'venta' | 'apartada' | 'vendida';
  collection: 'disponible' | 'referencia';
  featured: boolean;
  type: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  area: string;
  location: string;
  municipality: string;
  state: string;
  summary: string;
  description: string[];
  amenities: string[];
  images: string[];
  map_query: string;
}

export const site = siteJson;
export const properties = propertiesJson as Property[];
export const featured: Property = properties.find((p) => p.featured) ?? properties[0];

export const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/contacto', label: 'Contacto' },
  // 'Sobre mí' (/sobre-mi) sigue oculta hasta tener foto. Re-agregar aquí para mostrarla.
];

export function waLink(message: string = site.whatsapp_default_message): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function cardImage(p: Property): string {
  return p.images[0] ?? '/img/ui/no-photo.svg';
}
```

Nota: `astro/tsconfigs/strict` ya permite importar JSON; si el editor marcara error en los imports, agregar en `tsconfig.json`: `"compilerOptions": { "resolveJsonModule": true }`.

- [ ] **Step 6: Actualizar el script de test para correr toda la carpeta**

En `package.json`, cambiar la línea del script `test`:

```json
"test": "astro build && node --test tests/*.mjs"
```

Nota (corregido durante la ejecución): la forma de directorio `node --test tests/` falla en Node 24 en Windows con MODULE_NOT_FOUND; el patrón `tests/*.mjs` lo expande el propio runner de Node 21+ (no depende del shell) y funciona. La máquina local corre Node 24; el `.node-version` con Node 20 solo aplica al build de Cloudflare, que no corre tests.

- [ ] **Step 7: Verificar suite completa en verde**

Run: `npm test`
Expected: PASS. Corren `data.test.mjs` y `site.test.mjs`; el sitio viejo sigue intacto (los archivos nuevos son aditivos, `src/data/site.ts` y `src/data/propiedades.ts` viejos siguen existiendo hasta la Task 4).

- [ ] **Step 8: Commit**

```bash
git add data/ src/data/content.ts tests/data.test.mjs package.json
git commit -m "feat: datos del sitio en JSON editables con wrapper tipado y tests"
```

---

### Task 2: Assets v2, CSS global, app.js y chrome del sitio (layout, nav, footer)

**Files:**
- Create: `public/img/brand/logo-horizontal.svg`, `public/img/brand/logo-horizontal-light.svg`, `public/img/brand/logo-mark.svg` (copiados del v2)
- Create: `public/img/ui/no-photo.svg`, `public/img/ui/profile-placeholder.svg` (copiados del v2)
- Create: `public/js/app.js` (copiado del v2)
- Modify: `public/favicon.svg` (reemplazado por el del v2)
- Modify: `src/styles/global.css` (reemplazado por el styles.css del v2)
- Modify: `src/layouts/BaseLayout.astro`, `src/components/SEO.astro`, `src/components/Icon.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/WhatsAppFab.astro`
- Delete: `src/components/BrandLogo.astro` (el header/footer v2 usan `<img>` directo)
- Test: `tests/site.test.mjs` (solo el test de lang)

**Interfaces:**
- Consumes: `site`, `nav`, `waLink` de `src/data/content.ts` (Task 1).
- Produces:
  - `BaseLayout.astro` props: `{ title: string; description?: string; image?: string }` (igual que hoy; las páginas viejas siguen compilando).
  - `Icon.astro` props: `{ name: string; size?: number }` con los nombres del v2: `arrow, chevron, search, filter, pin, home, area, bed, bath, phone, mail, instagram, whatsapp, shield, check, chat, eye, calendar, camera, info, x, plus, user, compass, key, heart, external`. Nombre desconocido dibuja `check` (así los componentes viejos no truenan mientras existan).
  - `main` del layout lleva `id="contenido"` (ancla del skip-link).

- [ ] **Step 1: Copiar assets del v2**

```bash
V2="/c/Users/ANGEL/Downloads/habid-navarro-redesign-v2/habid-navarro-redesign-v2"
mkdir -p public/img/brand public/img/ui public/js
cp "$V2"/assets/img/brand/logo-horizontal.svg "$V2"/assets/img/brand/logo-horizontal-light.svg "$V2"/assets/img/brand/logo-mark.svg public/img/brand/
cp "$V2"/assets/img/ui/no-photo.svg "$V2"/assets/img/ui/profile-placeholder.svg public/img/ui/
cp "$V2"/favicon.svg public/favicon.svg
cp "$V2"/assets/css/styles.css src/styles/global.css
cp "$V2"/assets/js/app.js public/js/app.js
ls public/img/brand public/img/ui public/js
```

Expected: se listan 3 SVG de marca, 2 SVG de ui y `app.js`. Verificado: `styles.css` no contiene `url()` ni guiones largos, y `app.js` no referencia rutas de assets; se copian sin cambios.

- [ ] **Step 2: Reescribir Icon.astro con el set del v2**

Reemplazar `src/components/Icon.astro` por:

```astro
---
interface Props { name: string; size?: number; }
const { name, size = 20 } = Astro.props;
const paths: Record<string, string> = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  area: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v4H4M16 20v-4h4"/>',
  bed: '<path d="M3 19v-8M21 19v-8M3 15h18M7 11V7h5a3 3 0 0 1 3 3v1M3 11h4"/>',
  bath: '<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM7 12V6a3 3 0 0 1 6 0"/><path d="M10 19v2M17 19v2"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c1 .4 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/>',
  whatsapp: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8.3 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.6.7c-.2.2-.1.4 0 .6.7 1.2 1.6 2 2.8 2.7.2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.5 0 .3-.2 1.5-1.1 2-.7.5-1.7.7-2.8.4-1-.3-2.5-.9-4.2-2.4-1.4-1.3-2.4-2.9-2.7-4-.3-.9 0-1.9.3-2.4Z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  chat: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  camera: '<path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><circle cx="12" cy="13" r="4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l2 2M14 9l2 2"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  external: '<path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
};
const path = paths[name] ?? paths.check;
---
<svg class="icon-inline" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><Fragment set:html={path} /></svg>
```

- [ ] **Step 3: Reescribir SEO.astro**

Reemplazar `src/components/SEO.astro` por:

```astro
---
import { site } from '../data/content';
interface Props { title: string; description?: string; image?: string; }
const { title, description = site.tagline, image = '/img/og-default.jpg' } = Astro.props;
const canonical = new URL(Astro.url.pathname, site.site_url).href;
const ogImage = new URL(image, site.site_url).href;
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<title>{title}</title>
<meta name="description" content={description} />
<meta name="theme-color" content="#2B7CC4" />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImage} />
<link rel="canonical" href={canonical} />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

- [ ] **Step 4: Reescribir Nav.astro (header v2 con skip-link y menú móvil)**

Reemplazar `src/components/Nav.astro` por:

```astro
---
import Icon from './Icon.astro';
import { nav, waLink } from '../data/content';
const defaultWa = waLink();
const current = Astro.url.pathname.replace(/\/$/, '') || '/';
const isCurrent = (href: string) => (href === '/' ? current === '/' : current.startsWith(href));
---
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="Habid Navarro Bienes Raíces, inicio">
      <img src="/img/brand/logo-horizontal.svg" width="420" height="72" alt="Habid Navarro Bienes Raíces" />
    </a>
    <nav class="desktop-nav" aria-label="Navegación principal">
      {nav.map((item) => (
        <a class="nav-link" href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>{item.label}</a>
      ))}
    </nav>
    <a class="btn btn-primary btn-sm header-cta" href={defaultWa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={17} /> Hablar por WhatsApp</a>
    <button class="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-navigation"><span></span></button>
  </div>
  <nav class="mobile-nav" id="mobile-navigation" aria-label="Navegación móvil">
    <div class="mobile-nav-inner">
      {nav.map((item) => <a class="nav-link" href={item.href}>{item.label}</a>)}
      <a class="btn btn-primary" href={defaultWa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" /> Hablar por WhatsApp</a>
    </div>
  </nav>
</header>
```

- [ ] **Step 5: Reescribir Footer.astro y WhatsAppFab.astro**

Reemplazar `src/components/Footer.astro` por:

```astro
---
import Icon from './Icon.astro';
import { site, nav, waLink } from '../data/content';
const defaultWa = waLink();
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="container footer-main">
    <div class="footer-brand">
      <img src="/img/brand/logo-horizontal-light.svg" width="420" height="72" alt="Habid Navarro Bienes Raíces" />
      <p>{site.tagline}. Información clara, acompañamiento directo y decisiones inmobiliarias con contexto.</p>
      <div class="footer-social">
        <a class="social-link" href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" /></a>
        <a class="social-link" href={defaultWa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" /></a>
        <a class="social-link" href={`mailto:${site.email}`} aria-label="Correo electrónico"><Icon name="mail" /></a>
      </div>
    </div>
    <div class="footer-col">
      <h3>Navegación</h3>
      <div class="footer-links">
        {nav.map((item) => <a href={item.href}>{item.label}</a>)}
      </div>
    </div>
    <div class="footer-col">
      <h3>Contacto</h3>
      <div class="footer-links">
        <a href={`tel:${site.phone}`}>{site.phone_display}</a>
        <a href={`mailto:${site.email}`}>{site.email}</a>
        <a href={site.instagram} target="_blank" rel="noopener noreferrer">{site.instagram_handle}</a>
        <span>{site.service_area}, México</span>
      </div>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© <span id="current-year">{year}</span> Habid Navarro Bienes Raíces.</span>
    <div class="footer-bottom-links"><a href="/aviso-de-privacidad">Aviso de privacidad</a><a href="/contacto">Contacto</a></div>
  </div>
</footer>
```

Reemplazar `src/components/WhatsAppFab.astro` por:

```astro
---
import Icon from './Icon.astro';
import { waLink } from '../data/content';
---
<a class="whatsapp-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp"><Icon name="whatsapp" size={21} /><span>WhatsApp</span></a>
```

- [ ] **Step 6: Reescribir BaseLayout.astro (lang es-MX, app.js, ancla contenido)**

Reemplazar `src/layouts/BaseLayout.astro` por:

```astro
---
import '../styles/global.css';
import SEO from '../components/SEO.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import WhatsAppFab from '../components/WhatsAppFab.astro';
interface Props { title: string; description?: string; image?: string; }
const { title, description, image } = Astro.props;
---
<!doctype html>
<html lang="es-MX">
  <head>
    <SEO title={title} description={description} image={image} />
    <script src="/js/app.js" defer is:inline></script>
    <noscript><style>.reveal{opacity:1 !important;transform:none !important}</style></noscript>
  </head>
  <body>
    <Nav />
    <main id="contenido"><slot /></main>
    <Footer />
    <WhatsAppFab />
  </body>
</html>
```

El script inline de reveal del layout viejo desaparece: `app.js` ya trae reveal, menú, filtros, lightbox, FAQ y formulario.

Nota (agregado durante la ejecución): el CSS del v2 oculta `.reveal` incondicionalmente y depende de `app.js` para mostrarlo; sin JavaScript el contenido quedaría invisible. El bloque `noscript` del head restaura la visibilidad en ese caso. Hallazgo del review de la Task 2.

- [ ] **Step 7: Borrar BrandLogo.astro y actualizar el test de lang**

```bash
git rm src/components/BrandLogo.astro
```

En `tests/site.test.mjs`, en el test `'home: lang es y etiquetas OG'`, cambiar:

```js
  assert.match(h, /<html lang="es-MX"/);
```

- [ ] **Step 8: Correr la suite**

Run: `npm test`
Expected: PASS. Las páginas viejas compilan con el chrome nuevo (misma interfaz de props). El test de hero viejo (`Ver propiedades`) sigue en verde porque `index.astro` aún no se toca. Nota: los estilos ya son v2 y el interior de las páginas aún es v1; ese desajuste visual es esperado y no se despliega.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: chrome v2 (layout, header, footer, iconos, css y js del rediseño)"
```

---

### Task 3: Componentes de propiedad + Home + Catálogo + Ficha

**Files:**
- Modify: `src/components/EstadoBadge.astro`, `src/components/PropertyCard.astro`, `src/components/CtaBand.astro`, `src/components/Gallery.astro`
- Create: `src/components/PageHero.astro`
- Modify: `src/pages/index.astro`, `src/pages/propiedades/index.astro`, `src/pages/propiedades/[slug].astro`
- Delete: `src/components/Hero.astro`, `src/components/KeyFacts.astro`, `src/components/AmenityGrid.astro` (quedan sin consumidores)
- Test: `tests/site.test.mjs` (tests de home, catálogo y ficha)

**Interfaces:**
- Consumes: `site, properties, featured, waLink, cardImage, Property` de `content.ts`; `Icon` (Task 2); `BaseLayout` (Task 2).
- Produces:
  - `EstadoBadge.astro` props: `{ property: Property }`. Renderiza `<span class="status-chip status-{status_key}">{status}</span>`.
  - `PropertyCard.astro` props: `{ property: Property; filters?: boolean }`. Con `filters` agrega `data-filter-card`, `data-search`, `data-status`, `data-municipality` (los usa `app.js`).
  - `CtaBand.astro` sin props.
  - `PageHero.astro` props: `{ title: string; crumbs: { label: string; href?: string }[] }` con slot para el párrafo.
  - `Gallery.astro` props: `{ property: Property }`. Incluye el markup del lightbox (`#lightbox`).

- [ ] **Step 1: Actualizar los tests de home, catálogo y ficha al copy v2 (fallarán)**

En `tests/site.test.mjs`:

Reemplazar el test `'home: hero minimal que lleva al catálogo'` por:

```js
test('home: hero v2 que lleva al catálogo', () => {
  const h = read('index.html');
  assert.match(h, /href="\/propiedades"/);
  assert.ok(h.includes('Explorar propiedades'), 'falta CTA "Explorar propiedades"');
  assert.ok(h.includes('Decide con claridad'), 'falta el titular del hero v2');
  assert.ok(!h.includes('Estructura de concreto colado'), 'el home no debe listar amenidades');
});
```

Reemplazar el test `'ficha: datos clave, amenidades y descripción'` por:

```js
test('ficha: datos clave, características y descripción', () => {
  assert.ok(exists('propiedades/casa-ocotlan/index.html'), 'falta la ficha');
  const h = read('propiedades/casa-ocotlan/index.html');
  assert.match(h, /\$2,500,000/);
  assert.match(h, /Precio publicado/);
  assert.match(h, /Características/);
  assert.match(h, /concreto colado/);
  assert.match(h, /id="lightbox"/);
});
```

Agregar después del test del catálogo:

```js
test('catálogo: filtros y estado vacío presentes', () => {
  const h = read('propiedades/index.html');
  assert.match(h, /id="property-search"/);
  assert.match(h, /id="property-status"/);
  assert.match(h, /id="property-municipality"/);
  assert.match(h, /id="no-results"/);
  assert.match(h, /data-filter-card/);
});
```

Run: `npm test`
Expected: FAIL en esos 3 tests (el markup viejo no tiene ese copy ni esos ids). El resto en verde.

- [ ] **Step 2: Reescribir EstadoBadge, PropertyCard y CtaBand**

Reemplazar `src/components/EstadoBadge.astro` por:

```astro
---
import type { Property } from '../data/content';
interface Props { property: Property; }
const { property } = Astro.props;
---
<span class={`status-chip status-${property.status_key}`}>{property.status}</span>
```

Reemplazar `src/components/PropertyCard.astro` por:

```astro
---
import Icon from './Icon.astro';
import EstadoBadge from './EstadoBadge.astro';
import { cardImage, type Property } from '../data/content';
interface Props { property: Property; filters?: boolean; }
const { property: p, filters = false } = Astro.props;
const href = `/propiedades/${p.slug}`;
const image = cardImage(p);
const searchText = [p.name, p.municipality, p.location, p.type, p.bedrooms, p.price].join(' ');
---
<article
  class="property-card reveal"
  data-filter-card={filters ? '' : undefined}
  data-search={filters ? searchText : undefined}
  data-status={filters ? p.status_key : undefined}
  data-municipality={filters ? p.municipality : undefined}
>
  <a class="property-media" href={href} aria-label={`Ver ${p.name}`}>
    <img src={image} alt={`${p.name} en ${p.municipality}`} loading="lazy" width="800" height="600" />
    <span class="property-overlay"></span>
    <EstadoBadge property={p} />
    {p.collection === 'referencia' && <span class="reference-chip">Referencia</span>}
  </a>
  <div class="property-body">
    <div class="property-location">{p.municipality} · {p.state}</div>
    <h3 class="property-title"><a href={href}>{p.name}</a></h3>
    <p class="property-summary">{p.summary}</p>
    <div class="property-facts"><span><Icon name="bed" size={15} /> {p.bedrooms}</span><span><Icon name="area" size={15} /> {p.area}</span></div>
    <div class="property-footer">
      <div class="property-price"><small>Precio publicado</small><strong>{p.price}</strong></div>
      <a class="card-arrow" href={href} aria-label={`Abrir ficha de ${p.name}`}><Icon name="arrow" size={18} /></a>
    </div>
  </div>
</article>
```

Reemplazar `src/components/CtaBand.astro` por:

```astro
---
import Icon from './Icon.astro';
import { waLink } from '../data/content';
---
<section class="section">
  <div class="container">
    <div class="cta-panel reveal">
      <div class="cta-content">
        <div class="cta-copy"><span class="eyebrow">Conversación directa</span><h2>Una buena decisión empieza con información clara.</h2><p>Cuéntame qué estás buscando. Revisamos opciones, contexto y siguientes pasos sin presión.</p></div>
        <div class="cta-actions"><a class="btn btn-primary" href={waLink('Hola Habid, quisiera platicar sobre una propiedad.')} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" /> Escribir ahora</a><a class="btn btn-secondary" href="/contacto">Ver contacto</a></div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Crear PageHero.astro y reescribir Gallery.astro**

Crear `src/components/PageHero.astro`:

```astro
---
interface Props { title: string; crumbs: { label: string; href?: string }[]; }
const { title, crumbs } = Astro.props;
---
<section class="page-hero">
  <div class="container">
    <div class="breadcrumbs">
      {crumbs.map((c) => <span>{c.href ? <a href={c.href}>{c.label}</a> : c.label}</span>)}
    </div>
    <h1>{title}</h1>
    <slot />
  </div>
</section>
```

Reemplazar `src/components/Gallery.astro` por:

```astro
---
import Icon from './Icon.astro';
import type { Property } from '../data/content';
interface Props { property: Property; }
const { property: p } = Astro.props;
const images = p.images.length ? p.images : ['/img/ui/no-photo.svg'];
const visible = images.slice(0, 5);
const hidden = images.slice(5);
const placeholders = Math.max(0, 3 - visible.length);
---
<div class="gallery">
  {visible.map((img, i) => (
    <button class="gallery-item" type="button" data-full={img} data-alt={`${p.name}, fotografía ${i + 1}`} aria-label={`Ampliar fotografía ${i + 1}`}>
      <img src={img} alt={`${p.name}, fotografía ${i + 1}`} width="1000" height="700" />
      {i === visible.length - 1 && images.length > 1 && (
        <span class="gallery-count"><Icon name="camera" size={15} /> Ver {images.length} fotos</span>
      )}
    </button>
  ))}
  {Array.from({ length: placeholders }).map(() => (
    <div class="gallery-item" aria-hidden="true"><img src="/img/ui/no-photo.svg" alt="" width="1000" height="700" /></div>
  ))}
  {hidden.map((img, i) => (
    <button class="gallery-item" style="display:none" type="button" data-full={img} data-alt={`${p.name}, fotografía ${i + 6}`} aria-label={`Ampliar fotografía ${i + 6}`}></button>
  ))}
</div>
<div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-label="Galería de fotografías">
  <button class="lightbox-btn lightbox-close" type="button" aria-label="Cerrar galería"><Icon name="x" /></button>
  <button class="lightbox-btn lightbox-prev" type="button" aria-label="Fotografía anterior"><span style="transform:rotate(180deg)"><Icon name="chevron" /></span></button>
  <img class="lightbox-image" id="lightbox-image" src="" alt="" />
  <button class="lightbox-btn lightbox-next" type="button" aria-label="Fotografía siguiente"><Icon name="chevron" /></button>
  <span class="lightbox-count" id="lightbox-count"></span>
</div>
```

- [ ] **Step 4: Reescribir la home (index.astro)**

Reemplazar `src/pages/index.astro` por:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Icon from '../components/Icon.astro';
import PropertyCard from '../components/PropertyCard.astro';
import CtaBand from '../components/CtaBand.astro';
import { properties, featured, waLink, cardImage } from '../data/content';
const p = featured;
const active = properties.filter((x) => x.collection === 'disponible');
const selected = [p, ...properties.filter((x) => x.slug !== p.slug).slice(0, 2)];
---
<BaseLayout title="Habid Navarro Bienes Raíces | Asesoría inmobiliaria en Jalisco" description="Asesoría inmobiliaria honesta en Jalisco. Explora propiedades y recibe acompañamiento directo para tomar una mejor decisión." image={cardImage(p)}>
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <span class="hero-kicker"><span class="hero-kicker-dot"></span>Asesoría inmobiliaria en Jalisco</span>
        <h1>Compra bien.<br /><span class="gradient-text">Decide con claridad.</span></h1>
        <p class="hero-lead">Propiedades presentadas con información directa, contexto local y acompañamiento personal de principio a fin.</p>
        <div class="hero-actions"><a class="btn btn-primary" href="/propiedades">Explorar propiedades <Icon name="arrow" /></a><a class="btn btn-secondary" href={waLink('Hola Habid, estoy buscando una propiedad en Jalisco.')} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" /> Cuéntame qué buscas</a></div>
        <div class="hero-proof">
          <div class="proof-item"><span class="proof-icon"><Icon name="shield" size={16} /></span>Información transparente</div>
          <div class="proof-item"><span class="proof-icon"><Icon name="chat" size={16} /></span>Trato directo</div>
          <div class="proof-item"><span class="proof-icon"><Icon name="pin" size={16} /></span>Conocimiento local</div>
        </div>
      </div>
      <div class="hero-visual" aria-label={`Propiedad destacada: ${p.name}`}>
        <a class="hero-main-photo" href={`/propiedades/${p.slug}`}><img src={cardImage(p)} alt={`Fachada de ${p.name}`} width="900" height="1100" /><span class="hero-property-caption"><small>Propiedad disponible</small><strong>{p.name}</strong><span>{p.location} · {p.municipality}</span></span></a>
        <div class="hero-price-card"><small>Precio publicado</small><strong>{p.price}</strong><span><i class="hero-kicker-dot"></i>{active.length} {active.length === 1 ? 'propiedad activa' : 'propiedades activas'}</span></div>
        <div class="hero-brand-orbit"><img src="/img/brand/logo-mark.svg" alt="" aria-hidden="true" /></div>
      </div>
    </div>
  </section>
  <section class="trust-strip" aria-label="Principios del servicio"><div class="container trust-grid"><div class="trust-item"><strong>Asesoría directa</strong><span>Hablas conmigo, no con un sistema</span></div><div class="trust-item"><strong>Información verificable</strong><span>Datos claros antes de avanzar</span></div><div class="trust-item"><strong>Enfoque local</strong><span>Atención en Jalisco</span></div><div class="trust-item"><strong>Sin presión</strong><span>Tu decisión, a tu ritmo</span></div></div></section>
  <section class="section">
    <div class="container">
      <div class="section-head"><div class="section-head-copy"><span class="eyebrow">Catálogo</span><h2 class="section-title">Propiedades y referencias recientes</h2><p class="section-lead">Una vista rápida del inventario y de operaciones de referencia. Cada ficha distingue claramente su estado.</p></div><a class="text-link" href="/propiedades">Ver catálogo completo <Icon name="arrow" size={17} /></a></div>
      <div class="property-grid">{selected.map((x) => <PropertyCard property={x} />)}</div>
    </div>
  </section>
  <section class="section surface">
    <div class="container">
      <div class="featured-block reveal">
        <div class="featured-image"><img src={p.images[1] ?? cardImage(p)} alt={`Interior de ${p.name}`} loading="lazy" width="1000" height="900" /></div>
        <div class="featured-content"><span class="eyebrow">Propiedad destacada</span><h2>{p.name}</h2><div class="featured-address"><Icon name="pin" size={18} /> {p.location}, {p.municipality}</div><div class="featured-price">{p.price}</div><p class="featured-copy">{p.summary}</p><div class="featured-stats"><div class="featured-stat"><strong>{p.area}</strong><span>Terreno</span></div><div class="featured-stat"><strong>{p.bedrooms}</strong><span>Distribución</span></div><div class="featured-stat"><strong>Hasta 3 niveles</strong><span>Potencial de crecimiento</span></div></div><div class="featured-actions"><a class="btn btn-primary" href={`/propiedades/${p.slug}`}>Ver ficha completa <Icon name="arrow" /></a><a class="btn btn-secondary" href={waLink(`Hola Habid, me interesa ${p.name}.`)} target="_blank" rel="noopener noreferrer">Consultar</a></div></div>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container"><div class="section-head"><div class="section-head-copy"><span class="eyebrow">Cómo trabajamos</span><h2 class="section-title">Un proceso simple, sin ruido.</h2><p class="section-lead">Menos promesas generales y más claridad en cada punto de la decisión.</p></div></div><div class="process-grid"><article class="process-card reveal"><h3>Entendemos tu búsqueda</h3><p>Presupuesto, ubicación, tiempos y prioridades reales antes de proponerte opciones.</p></article><article class="process-card reveal"><h3>Revisamos la propiedad</h3><p>Datos, condiciones y contexto para que sepas qué estás evaluando.</p></article><article class="process-card reveal"><h3>Acompañamos la decisión</h3><p>Visita, conversación y siguientes pasos con comunicación directa.</p></article></div></div>
  </section>
  <section class="section surface-blue">
    <div class="container"><div class="section-head"><div class="section-head-copy"><span class="eyebrow">Forma de trabajar</span><h2 class="section-title">La confianza se diseña con hechos.</h2></div></div><div class="values-grid"><article class="value-card reveal"><span class="value-icon"><Icon name="eye" /></span><h3>Transparencia</h3><p>Los estados y datos del catálogo se presentan sin ambigüedad.</p></article><article class="value-card reveal"><span class="value-icon"><Icon name="compass" /></span><h3>Contexto</h3><p>No sólo ves una casa: entiendes ubicación, uso y posibilidades.</p></article><article class="value-card reveal"><span class="value-icon"><Icon name="user" /></span><h3>Atención personal</h3><p>La comunicación es directa y con seguimiento puntual.</p></article><article class="value-card reveal"><span class="value-icon"><Icon name="heart" /></span><h3>Sin presión</h3><p>La prioridad es una decisión que tenga sentido para ti.</p></article></div></div>
  </section>
  <CtaBand />
</BaseLayout>
```

- [ ] **Step 5: Reescribir el catálogo (propiedades/index.astro)**

Reemplazar `src/pages/propiedades/index.astro` por:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Icon from '../../components/Icon.astro';
import PageHero from '../../components/PageHero.astro';
import PropertyCard from '../../components/PropertyCard.astro';
import CtaBand from '../../components/CtaBand.astro';
import { properties } from '../../data/content';
const municipalities = [...new Set(properties.map((p) => p.municipality))].sort();
---
<BaseLayout title="Propiedades | Habid Navarro Bienes Raíces" description="Catálogo inmobiliario de Habid Navarro en Jalisco, con estados claros, filtros y fichas detalladas.">
  <PageHero title="Propiedades con información clara." crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Propiedades' }]}>
    <p>Explora la propiedad disponible y antecedentes de catálogo. Los estados se muestran de forma explícita para evitar confusiones.</p>
  </PageHero>
  <div class="filter-bar">
    <div class="container filter-grid">
      <label class="field-shell" for="property-search"><Icon name="search" size={18} /><input id="property-search" type="search" placeholder="Buscar por zona, municipio o tipo…" autocomplete="off" /></label>
      <label class="field-shell" for="property-status"><Icon name="filter" size={18} /><select id="property-status" aria-label="Filtrar por estado"><option value="all">Todos los estados</option><option value="venta">En venta</option><option value="apartada">Apartadas</option><option value="vendida">Vendidas</option></select></label>
      <label class="field-shell" for="property-municipality"><Icon name="pin" size={18} /><select id="property-municipality" aria-label="Filtrar por municipio"><option value="all">Todos los municipios</option>{municipalities.map((m) => <option value={m}>{m}</option>)}</select></label>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="catalog-note"><Icon name="info" size={20} /><div><strong>Catálogo transparente.</strong> La casa en Ocotlán es la propiedad activa publicada. Las fichas marcadas como “Referencia” muestran el formato del catálogo y antecedentes apartados o vendidos; su disponibilidad no se presume.</div></div>
      <div class="results-meta"><span>Mostrando <strong id="result-count">{properties.length} propiedades</strong></span></div>
      <div class="property-grid">{properties.map((p) => <PropertyCard property={p} filters={true} />)}</div>
      <div class="no-results" id="no-results"><h3>No encontramos coincidencias</h3><p>Prueba con otro municipio, estado o palabra clave.</p></div>
    </div>
  </section>
  <CtaBand />
</BaseLayout>
```

Nota: la línea del v2 "Actualiza el inventario desde data/properties.json" era una nota de desarrollo visible al público y NO se porta.

- [ ] **Step 6: Reescribir la ficha (propiedades/[slug].astro)**

Reemplazar `src/pages/propiedades/[slug].astro` por:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Icon from '../../components/Icon.astro';
import EstadoBadge from '../../components/EstadoBadge.astro';
import Gallery from '../../components/Gallery.astro';
import PropertyCard from '../../components/PropertyCard.astro';
import CtaBand from '../../components/CtaBand.astro';
import { properties, site, waLink, cardImage, type Property } from '../../data/content';

export function getStaticPaths() {
  return properties.map((p) => ({ params: { slug: p.slug }, props: { p } }));
}
interface Props { p: Property; }
const { p } = Astro.props;
const message = `Hola Habid, me interesa ${p.name} en ${p.municipality} y quisiera más información.`;
const related = properties.filter((x) => x.slug !== p.slug).slice(0, 3);
const mapUrl = p.map_query ? `https://www.google.com/maps?q=${encodeURIComponent(p.map_query)}&output=embed` : '';
---
<BaseLayout title={`${p.name} | Habid Navarro Bienes Raíces`} description={p.summary} image={cardImage(p)}>
  <section class="detail-top">
    <div class="container">
      <div class="breadcrumbs"><span><a href="/">Inicio</a></span><span><a href="/propiedades">Propiedades</a></span><span>{p.name}</span></div>
      <div class="detail-heading">
        <div>
          <EstadoBadge property={p} />
          <h1>{p.name}</h1>
          <div class="detail-subline"><span><Icon name="pin" size={16} /> {p.location}, {p.municipality}</span><span><Icon name="home" size={16} /> {p.type}</span></div>
        </div>
        <div class="detail-price"><small>Precio publicado</small><strong>{p.price}</strong></div>
      </div>
      {p.collection === 'referencia' && (
        <div class="detail-notice"><Icon name="info" size={18} /><div><strong>Ficha de referencia.</strong> Esta propiedad figura como {p.status.toLowerCase()} y no se presenta como inventario activo. Confirma cualquier dato directamente.</div></div>
      )}
      <Gallery property={p} />
    </div>
  </section>
  <section>
    <div class="container detail-layout">
      <article class="detail-main">
        <h2>Una propiedad para entender a detalle.</h2>
        {p.description.map((paragraph) => <p>{paragraph}</p>)}
        <section class="detail-section">
          <h2>Datos principales</h2>
          <div class="fact-grid">
            <div class="fact-box"><Icon name="area" /><strong>{p.area}</strong><span>Superficie</span></div>
            <div class="fact-box"><Icon name="bed" /><strong>{p.bedrooms}</strong><span>Recámaras</span></div>
            <div class="fact-box"><Icon name="bath" /><strong>{p.bathrooms}</strong><span>Baños</span></div>
            <div class="fact-box"><Icon name="pin" /><strong>{p.municipality}</strong><span>Municipio</span></div>
          </div>
        </section>
        <section class="detail-section">
          <h2>Características</h2>
          <ul class="amenity-grid">{p.amenities.map((a) => <li class="amenity">{a}</li>)}</ul>
        </section>
        {mapUrl && (
          <section class="detail-section">
            <h2>Ubicación</h2>
            <p>La dirección publicada permite entender su relación con servicios y equipamiento de {p.municipality}.</p>
            <div class="map-wrap"><iframe src={mapUrl} title={`Mapa de ${p.name}`} loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
          </section>
        )}
      </article>
      <aside class="contact-card">
        <div class="contact-card-brand"><img src="/img/brand/logo-mark.svg" alt="" /><div><strong>{site.name}</strong><span>Asesor inmobiliario en Jalisco</span></div></div>
        <h3>¿Te interesa esta propiedad?</h3>
        <p>Escríbeme para confirmar información, disponibilidad y agendar una conversación.</p>
        <div class="contact-card-actions">
          <a class="btn btn-wa btn-block" href={waLink(message)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" /> WhatsApp</a>
          <a class="btn btn-secondary btn-block" href={`tel:${site.phone}`}><Icon name="phone" /> Llamar</a>
        </div>
        <div class="contact-card-foot">Respuesta directa · Sin formularios interminables</div>
      </aside>
    </div>
  </section>
  <section class="section surface">
    <div class="container">
      <div class="section-head"><div class="section-head-copy"><span class="eyebrow">Más opciones</span><h2 class="section-title">Explora otras fichas</h2></div><a class="text-link" href="/propiedades">Ver catálogo <Icon name="arrow" size={17} /></a></div>
      <div class="property-grid">{related.map((x) => <PropertyCard property={x} />)}</div>
    </div>
  </section>
  <CtaBand />
</BaseLayout>
```

- [ ] **Step 7: Borrar componentes sin consumidores**

```bash
git rm src/components/Hero.astro src/components/KeyFacts.astro src/components/AmenityGrid.astro
```

- [ ] **Step 8: Correr la suite y verificar verde**

Run: `npm test`
Expected: PASS completo, incluidos los 3 tests actualizados en Step 1. Si `astro build` falla por imports rotos, revisar que ninguna página siga importando Hero, KeyFacts o AmenityGrid.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: home, catálogo con filtros y fichas con galería en diseño v2"
```

---

### Task 4: Contacto, Sobre mí, Aviso de privacidad y 404

**Files:**
- Modify: `src/pages/contacto.astro`, `src/pages/sobre-mi.astro`, `src/pages/aviso-de-privacidad.astro`
- Create: `src/pages/404.astro`
- Delete: `src/data/site.ts`, `src/data/propiedades.ts`, `public/img/placeholder/habid.svg` (últimos consumidores desaparecen aquí)
- Test: `tests/site.test.mjs` (tests de sobre-mi y assets)

**Interfaces:**
- Consumes: `site, properties, waLink` de `content.ts`; `BaseLayout`, `Icon`, `PageHero`, `CtaBand`.
- Produces: nada que consuman tareas posteriores (páginas hoja). El formulario `#contact-form` con `data-whatsapp` es el punto de enganche que la Fase 2 cambiará a `/api/lead`.

- [ ] **Step 1: Actualizar tests de sobre-mi y assets (fallarán)**

En `tests/site.test.mjs`:

En el test `'sobre-mi: bio presente y SIN mención de cédula'`, mantenerlo igual (el copy nuevo del Step 3 incluye la frase "asesor inmobiliario en Jalisco" en minúsculas dentro del cuerpo).

Reemplazar el test `'assets: favicon, og e imágenes de muestra presentes en dist'` por:

```js
test('assets: favicon, og, marca e imágenes presentes en dist', () => {
  assert.ok(exists('favicon.svg'), 'falta favicon.svg');
  assert.ok(exists('robots.txt'), 'falta robots.txt');
  assert.ok(exists('img/og-default.jpg'), 'falta og-default.jpg');
  assert.ok(exists('img/ocotlan/ocotlan-1.jpg'), 'falta ocotlan-1.jpg');
  assert.ok(exists('img/brand/logo-horizontal.svg'), 'falta logo horizontal');
  assert.ok(exists('img/brand/logo-mark.svg'), 'falta logo mark');
  assert.ok(exists('img/ui/no-photo.svg'), 'falta no-photo.svg');
  assert.ok(exists('img/ui/profile-placeholder.svg'), 'falta profile-placeholder.svg');
  assert.ok(exists('js/app.js'), 'falta app.js');
  assert.ok(exists('404.html'), 'falta 404.html');
});
```

Run: `npm test`
Expected: FAIL solo el test de assets (aún no existe `dist/404.html`; lo demás ya existe). Nota: `habid.svg` deja de verificarse porque se elimina en esta task.

- [ ] **Step 2: Reescribir contacto.astro**

Reemplazar `src/pages/contacto.astro` por:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Icon from '../components/Icon.astro';
import PageHero from '../components/PageHero.astro';
import { site, properties, waLink } from '../data/content';
---
<BaseLayout title="Contacto | Habid Navarro Bienes Raíces" description="Contacta a Habid Navarro por WhatsApp, teléfono, correo o Instagram para recibir orientación inmobiliaria en Jalisco.">
  <PageHero title="Hablemos de lo que estás buscando." crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Contacto' }]}>
    <p>Comparte tu necesidad y prepara un mensaje de WhatsApp con la información esencial. No se envían datos a servidores externos.</p>
  </PageHero>
  <section class="section">
    <div class="container contact-layout">
      <aside class="contact-info">
        <h2>Contacto directo</h2>
        <p>Elige el canal que te resulte más cómodo. La atención es personal.</p>
        <div class="contact-list">
          <a class="contact-line" href={waLink('Hola Habid, quisiera recibir información inmobiliaria.')} target="_blank" rel="noopener noreferrer"><span class="contact-line-icon"><Icon name="whatsapp" /></span><span><small>WhatsApp</small><strong>{site.phone_display}</strong></span></a>
          <a class="contact-line" href={`tel:${site.phone}`}><span class="contact-line-icon"><Icon name="phone" /></span><span><small>Teléfono</small><strong>{site.phone_display}</strong></span></a>
          <a class="contact-line" href={`mailto:${site.email}`}><span class="contact-line-icon"><Icon name="mail" /></span><span><small>Correo</small><strong>{site.email}</strong></span></a>
          <a class="contact-line" href={site.instagram} target="_blank" rel="noopener noreferrer"><span class="contact-line-icon"><Icon name="instagram" /></span><span><small>Instagram</small><strong>{site.instagram_handle}</strong></span></a>
        </div>
      </aside>
      <div class="form-card">
        <h2>Prepara tu mensaje</h2>
        <p>Al enviar, se abrirá WhatsApp con el texto listo para revisar.</p>
        <form id="contact-form" data-whatsapp={site.whatsapp}>
          <div class="form-grid">
            <label class="form-group"><span class="form-label">Nombre</span><input class="form-input" name="name" type="text" required placeholder="Tu nombre" /></label>
            <label class="form-group"><span class="form-label">Teléfono</span><input class="form-input" name="phone" type="tel" placeholder="Tu número" /></label>
            <label class="form-group full"><span class="form-label">Propiedad o tipo de búsqueda</span><select class="form-input" name="interest"><option value="">Estoy buscando una propiedad</option>{properties.map((p) => <option>{p.name} · {p.municipality}</option>)}<option>Quiero vender una propiedad</option><option>Necesito orientación general</option></select></label>
            <label class="form-group full"><span class="form-label">Mensaje</span><textarea class="form-input" name="message" placeholder="Zona, presupuesto, tiempos o cualquier dato útil"></textarea></label>
          </div>
          <button class="btn btn-primary form-submit" type="submit"><Icon name="whatsapp" /> Abrir en WhatsApp</button>
          <p class="form-help">Este formulario no almacena información: construye el mensaje en tu dispositivo.</p>
        </form>
      </div>
    </div>
  </section>
  <section class="section surface">
    <div class="container">
      <div class="section-head" style="justify-content:center;text-align:center"><div class="section-head-copy"><span class="eyebrow">Preguntas frecuentes</span><h2 class="section-title">Antes de escribir</h2></div></div>
      <div class="faq-list">
        <article class="faq-item"><button class="faq-question" type="button" aria-expanded="false">¿La casa de Ocotlán sigue disponible? <Icon name="plus" /></button><div class="faq-answer"><div><p>La ficha se muestra como “En venta”, pero conviene confirmar la disponibilidad directamente antes de programar una visita.</p></div></div></article>
        <article class="faq-item"><button class="faq-question" type="button" aria-expanded="false">¿Las demás propiedades están disponibles? <Icon name="plus" /></button><div class="faq-answer"><div><p>No se presentan como inventario activo. Están marcadas como referencias apartadas o vendidas para mostrar antecedentes y el formato del catálogo.</p></div></div></article>
        <article class="faq-item"><button class="faq-question" type="button" aria-expanded="false">¿La atención es únicamente por WhatsApp? <Icon name="plus" /></button><div class="faq-answer"><div><p>No. También puedes llamar o escribir por correo; WhatsApp es simplemente el canal más inmediato.</p></div></div></article>
      </div>
    </div>
  </section>
</BaseLayout>
```

Nota: las opciones del select usan `·` donde el v2 usaba guion largo.

- [ ] **Step 3: Reescribir sobre-mi.astro**

Reemplazar `src/pages/sobre-mi.astro` por:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Icon from '../components/Icon.astro';
import PageHero from '../components/PageHero.astro';
import CtaBand from '../components/CtaBand.astro';
---
<BaseLayout title="Sobre Habid Navarro | Bienes Raíces en Jalisco" description="Conoce el enfoque de Habid Navarro: asesoría inmobiliaria directa, transparente y sin presión en Jalisco.">
  <PageHero title="Asesoría cercana, información directa." crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Sobre mí' }]}>
    <p>Una relación inmobiliaria funciona mejor cuando sabes con quién hablas, qué puedes esperar y cómo se tomarán las decisiones.</p>
  </PageHero>
  <section class="section">
    <div class="container about-grid">
      <div class="about-photo reveal"><img src="/img/ui/profile-placeholder.svg" alt="Espacio preparado para la fotografía profesional de Habid Navarro" width="760" height="920" /></div>
      <div class="about-copy">
        <span class="eyebrow">Habid Navarro</span>
        <h2>Tu decisión merece contexto, no presión.</h2>
        <p>Mi forma de trabajar parte de una idea sencilla: una propiedad no debe venderse sólo con fotografías atractivas. También necesita información ordenada, expectativas realistas y una conversación honesta sobre lo que sí ofrece.</p>
        <p>Trabajo como asesor inmobiliario en Jalisco, con atención directa. Escucho lo que buscas, te ayudo a organizar criterios y presento cada opción con claridad para que puedas decidir con calma.</p>
        <p>Este sitio también refleja ese enfoque: estados visibles, fichas comprensibles, contacto inmediato y una separación explícita entre inventario activo y referencias de catálogo.</p>
        <div class="about-signature"><img src="/img/brand/logo-mark.svg" alt="" /><div><strong>Habid Navarro</strong><span>Bienes Raíces · Jalisco</span></div></div>
      </div>
    </div>
  </section>
  <section class="section surface-blue">
    <div class="container">
      <div class="section-head"><div class="section-head-copy"><span class="eyebrow">Principios</span><h2 class="section-title">Qué puedes esperar al trabajar conmigo.</h2></div></div>
      <div class="values-grid">
        <article class="value-card reveal"><span class="value-icon"><Icon name="chat" /></span><h3>Comunicación clara</h3><p>Respuestas directas y acuerdos entendibles durante el proceso.</p></article>
        <article class="value-card reveal"><span class="value-icon"><Icon name="shield" /></span><h3>Transparencia</h3><p>Información relevante antes de avanzar a una visita o negociación.</p></article>
        <article class="value-card reveal"><span class="value-icon"><Icon name="compass" /></span><h3>Criterio local</h3><p>Atención a la ubicación, servicios, uso y potencial de cada zona.</p></article>
        <article class="value-card reveal"><span class="value-icon"><Icon name="heart" /></span><h3>Respeto por tu ritmo</h3><p>Una decisión inmobiliaria importante no debe sentirse apresurada.</p></article>
      </div>
    </div>
  </section>
  <CtaBand />
</BaseLayout>
```

- [ ] **Step 4: Reescribir aviso-de-privacidad.astro (con derechos ARCO)**

Reemplazar `src/pages/aviso-de-privacidad.astro` por:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PageHero from '../components/PageHero.astro';
import { site } from '../data/content';
---
<BaseLayout title="Aviso de privacidad | Habid Navarro" description="Aviso de privacidad y funcionamiento de los canales de contacto de Habid Navarro Bienes Raíces.">
  <PageHero title="Aviso de privacidad." crumbs={[{ label: 'Inicio', href: '/' }, { label: 'Aviso de privacidad' }]}>
    <p>Información general sobre el uso de datos y canales de contacto de este sitio.</p>
  </PageHero>
  <section class="section">
    <article class="narrow privacy-content">
      <h2>Responsable</h2>
      <p>Habid Navarro Bienes Raíces es responsable del tratamiento de la información que una persona decida compartir mediante los canales de contacto publicados en este sitio.</p>
      <h2>Información recabada</h2>
      <p>Este sitio no almacena información en una base de datos propia. El formulario de contacto únicamente construye un mensaje y abre WhatsApp en el dispositivo de la persona usuaria.</p>
      <p>Al contactar por WhatsApp, teléfono, correo electrónico o Instagram, el tratamiento de la información también queda sujeto a las condiciones de la plataforma utilizada.</p>
      <h2>Finalidades</h2>
      <ul>
        <li>Responder solicitudes de información inmobiliaria.</li>
        <li>Coordinar conversaciones o visitas.</li>
        <li>Dar seguimiento a una propiedad específica.</li>
        <li>Atender solicitudes relacionadas con compra, venta u orientación.</li>
      </ul>
      <h2>Derechos ARCO y contacto</h2>
      <p>Para ejercer los derechos ARCO (acceso, rectificación, cancelación y oposición) sobre la información compartida directamente, escribe a <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
      <h2>Actualizaciones</h2>
      <p>Este aviso puede modificarse cuando cambien las funciones del sitio o los canales de atención. Última actualización: julio de 2026.</p>
    </article>
  </section>
</BaseLayout>
```

Nota: cuando la Fase 2 active la captura de leads en base de datos, la sección "Información recabada" DEBE actualizarse (queda registrado en el spec de la Fase 2).

- [ ] **Step 5: Crear 404.astro**

Crear `src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Icon from '../components/Icon.astro';
---
<BaseLayout title="Página no encontrada | Habid Navarro" description="La página solicitada no existe.">
  <section class="error-page">
    <div>
      <div class="error-mark">404</div>
      <h1>Esta propiedad no está aquí.</h1>
      <p>La dirección puede haber cambiado o la página ya no existe. Regresa al catálogo para continuar.</p>
      <a class="btn btn-primary" href="/">Volver al inicio <Icon name="arrow" /></a>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 6: Borrar los datos viejos y el placeholder anterior**

```bash
git rm src/data/site.ts src/data/propiedades.ts
git rm public/img/placeholder/habid.svg
```

Verificar que nadie más los importa:

```bash
grep -rn "data/site'" src/ ; grep -rn "data/propiedades" src/ ; grep -rn "placeholder/habid" src/
```

Expected: sin resultados.

- [ ] **Step 7: Correr la suite y verificar verde**

Run: `npm test`
Expected: PASS completo (incluye el test de assets nuevo con 404.html y los SVG de marca).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: contacto, sobre mí, aviso de privacidad y 404 en diseño v2"
```

---

### Task 5: Guardia de guiones largos, docs y deploy de preview

**Files:**
- Test: `tests/site.test.mjs` (test global de guiones largos en dist)
- Modify: `GUIA.md`, `README.md` (referencias a los datos ahora en JSON)

**Interfaces:**
- Consumes: dist generado por `astro build`.
- Produces: URL de preview en Cloudflare Pages para aprobación del usuario. Producción NO se toca en esta task.

- [ ] **Step 1: Agregar el test global de guiones largos (debe pasar a la primera si el port fue limpio)**

Agregar al final de `tests/site.test.mjs`:

```js
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

test('ninguna página del build contiene guiones largos', () => {
  const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
  const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const full = `${dir}/${name}`;
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith('.html') ? [full] : [];
  });
  for (const file of walk(distDir)) {
    assert.ok(!readFileSync(file, 'utf8').includes(String.fromCharCode(0x2014)), `guion largo en ${file}`);
  }
});
```

(Los imports `readdirSync`, `statSync` y `fileURLToPath` van junto a los imports existentes al inicio del archivo, no en medio; `readFileSync` ya está importado.)

- [ ] **Step 2: Correr la suite**

Run: `npm test`
Expected: PASS. Si este test falla, el mensaje indica el archivo; corregir el texto de origen (componente o JSON), no el HTML generado.

- [ ] **Step 3: Actualizar GUIA.md y README.md**

Localizar referencias obsoletas:

```bash
grep -n "src/data" GUIA.md README.md
```

En cada coincidencia, reemplazar `src/data/site.ts` por `data/site.json` y `src/data/propiedades.ts` por `data/properties.json`, ajustando la redacción de los pasos de edición (los datos ahora se editan en JSON plano, sin tocar TypeScript). No cambiar las secciones de deploy.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: guardia de guiones largos en el build y docs con datos en JSON"
```

- [ ] **Step 5: Deploy de preview (NO producción)**

```bash
export XDG_CONFIG_HOME="/c/Users/ANGEL/AppData/Roaming/xdg.config"
export CLOUDFLARE_ACCOUNT_ID="f79ce76b08359ad1f451b9b45a97419e"
npm run build && npx wrangler pages deploy dist --project-name habidnavarro --branch preview-v2 --commit-dirty=true
```

Expected: wrangler imprime una URL de preview (subdominio de habidnavarro.pages.dev). Producción (branch `main`) queda intacta. Si falla con error de autenticación, el token OAuth expiró: pedir al usuario correr `! npx -y wrangler login`.

- [ ] **Step 6: Entregar la URL de preview al usuario**

Compartir la URL y pedir su visto bueno. El deploy a producción (`--branch main`) se hace SOLO con aprobación explícita del usuario, con el mismo comando cambiando el branch. Empujar también los commits a GitHub: `git push`.

---

## Self-review del plan

- Cobertura del spec (Fase 1): datos en JSON editables (Task 1), CSS/JS/branding v2 (Task 2), páginas y componentes re-maquetados con rutas intactas (Tasks 3 y 4), sitemap y SEO conservados (config no se toca; SEO.astro reescrito), tests mantenidos y ampliados con validación de esquema (Tasks 1 a 5), sitio publicable al cierre (Task 5). Las Fases 2 a 4 del spec (leads, CMS, endurecimiento) quedan para planes posteriores.
- Sin placeholders: cada paso incluye código completo o comando exacto con resultado esperado.
- Consistencia de tipos: `Property`, `site`, `waLink`, `cardImage`, `featured` y `nav` se definen en Task 1 y se consumen con esos mismos nombres en Tasks 2 a 4; `EstadoBadge`/`PropertyCard`/`Gallery` reciben `property` en todas las páginas.
