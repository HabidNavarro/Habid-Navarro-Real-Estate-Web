# Sitio web Habid Navarro Bienes Raíces — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un mini-sitio estático de 5 vistas (Inicio, Propiedades, ficha Valle Imperial, Sobre mí, Contacto) con estilo "Oscuro Premium", listo para desplegar gratis en Cloudflare Pages.

**Architecture:** Sitio estático con **Astro 5**. Datos de marca/contacto en `src/data/site.ts` y propiedades como arreglo tipado en `src/data/propiedades.ts` (agregar propiedad = agregar una entrada). UI en componentes `.astro` reutilizables sobre un `BaseLayout`. CSS propio con *design tokens*. Contacto por enlaces directos (WhatsApp/llamada/correo), sin backend.

**Tech Stack:** Astro 5, `@astrojs/sitemap`, CSS (sin framework), Node test runner (`node:test`) sobre el HTML compilado en `dist/`. Despliegue: Cloudflare Pages.

**Convenciones de prueba (importante):** Para un sitio estático, las pruebas valiosas son: (1) que `astro build` compile (valida imports, TS y rutas) y (2) aserciones sobre el HTML generado en `dist/`. No probamos componentes `.astro` en aislamiento (mala práctica para este caso). El comando `npm test` corre `astro build` y luego `node --test`. El "rojo" de TDD se ve como una aserción que falla (ruta o contenido ausente) o como un build que falla.

**Rama de trabajo:** `feat/sitio-web` (ya creada, contiene el spec).

**Datos pendientes:** Los campos del terreno se dejan **literalmente** como `****` (precio, superficie, tipo, ubicación, mapa) para que Habid recuerde actualizarlos antes de publicar. Esto es intencional, no un hueco del plan.

---

## Estructura de archivos

```
package.json                          # scripts + deps
astro.config.mjs                      # site + sitemap
tsconfig.json                         # strict
.gitignore                            # (ya existe; se añade .astro/)
public/
  favicon.svg                         # ícono (techo en azul de marca)
  robots.txt
  img/
    og-default.jpg                    # imagen para compartir (1200x630)
    placeholder/
      valle-1.jpg ... valle-4.jpg     # fotos de muestra (swappables)
      habid.svg                       # placeholder "foto por agregar"
src/
  styles/global.css                   # tokens + base + utilidades
  data/
    site.ts                           # marca, contacto, nav, waLink()
    propiedades.ts                    # interface Propiedad + arreglo
  components/
    BrandLogo.astro                   # logo (SVG techo + wordmark)
    SEO.astro                         # <head> meta + OG
    Nav.astro                         # navegación fija + menú móvil
    Footer.astro                      # footer global
    WhatsAppFab.astro                 # botón flotante
    Hero.astro                        # hero de inicio
    PropertyCard.astro                # tarjeta de propiedad
    KeyFacts.astro                    # datos clave
    AmenityGrid.astro                 # rejilla de amenidades
    Gallery.astro                     # galería
    CtaBand.astro                     # franja CTA
  layouts/BaseLayout.astro            # html + head + Nav + slot + Footer + Fab
  pages/
    index.astro                       # /
    propiedades/index.astro           # /propiedades
    propiedades/[slug].astro          # /propiedades/valle-imperial
    sobre-mi.astro                    # /sobre-mi
    contacto.astro                    # /contacto
    aviso-de-privacidad.astro         # /aviso-de-privacidad
tests/site.test.mjs                   # aserciones sobre dist/
```

---

### Task 1: Scaffold de Astro + arnés de pruebas

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro` (temporal), `tests/site.test.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: Escribe la prueba que falla**

Create `tests/site.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const dist = (p) => new URL(`../dist/${p}`, import.meta.url);
export const read = (p) => readFileSync(dist(p), 'utf8');
export const exists = (p) => existsSync(dist(p));

test('el build genera dist/index.html', () => {
  assert.ok(exists('index.html'), 'no se generó dist/index.html');
});
```

- [ ] **Step 2: Crea los archivos de configuración**

Create `package.json`:

```json
{
  "name": "habid-navarro-web",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "astro build && node --test"
  },
  "dependencies": {
    "astro": "^5",
    "@astrojs/sitemap": "^3"
  }
}
```

Create `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://habidnavarro.com',
  integrations: [sitemap()],
});
```

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

Create `src/pages/index.astro` (temporal, se reemplaza en Task 4):

```astro
---
---
<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /><title>Habid Navarro</title></head>
  <body><h1>Habid Navarro</h1></body>
</html>
```

Append to `.gitignore` (después de la línea `node_modules/`):

```
.astro/
```

- [ ] **Step 3: Instala dependencias**

Run: `npm install`
Expected: crea `node_modules/` y `package-lock.json` sin errores. (Estas instrucciones apuntan a Astro 5; si `npm` instala otra major, ajusta la sintaxis de content/config según corresponda — este plan no usa content collections, así que el riesgo es bajo.)

- [ ] **Step 4: Corre la prueba (debe pasar tras compilar)**

Run: `npm test`
Expected: `astro build` compila y la prueba "el build genera dist/index.html" pasa (1 passing).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/pages/index.astro tests/site.test.mjs .gitignore
git commit -m "chore: scaffold de Astro y arnés de pruebas"
```

---

### Task 2: Shell del sitio (tokens, logo, SEO, layout, nav, footer, WhatsApp)

Crea la base visual y estructural compartida por todas las páginas.

**Files:**
- Create: `src/styles/global.css`, `src/data/site.ts`, `src/components/BrandLogo.astro`, `src/components/SEO.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/WhatsAppFab.astro`, `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`, `tests/site.test.mjs`

- [ ] **Step 1: Añade las pruebas que fallan**

Replace the contents of `tests/site.test.mjs` with:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const dist = (p) => new URL(`../dist/${p}`, import.meta.url);
const read = (p) => readFileSync(dist(p), 'utf8');
const exists = (p) => existsSync(dist(p));

test('el build genera dist/index.html', () => {
  assert.ok(exists('index.html'));
});

test('home: lang es y etiquetas OG', () => {
  const h = read('index.html');
  assert.match(h, /<html lang="es"/);
  assert.match(h, /property="og:title"/);
  assert.match(h, /property="og:image"/);
  assert.match(h, /name="description"/);
});

test('home: navegación con las 4 secciones', () => {
  const h = read('index.html');
  for (const label of ['Inicio', 'Propiedades', 'Sobre mí', 'Contacto']) {
    assert.ok(h.includes(label), `falta nav "${label}"`);
  }
});

test('home: botón flotante de WhatsApp con número correcto', () => {
  assert.match(read('index.html'), /wa\.me\/523921075791/);
});

test('home: footer con teléfono, correo y aviso de privacidad', () => {
  const h = read('index.html');
  assert.match(h, /tel:\+523921075791/);
  assert.match(h, /mailto:habid\.realestate@gmail\.com/);
  assert.match(h, /Aviso de privacidad/);
});
```

- [ ] **Step 2: Crea los design tokens y estilos base**

Create `src/styles/global.css`:

```css
:root{
  --bg:#0B0F14; --surface:#11161C; --surface-2:#0E141A; --border:#1C2630;
  --text:#E7EDF3; --muted:#9AA6B2; --accent:#3BB5E8; --accent-2:#2B7CC4;
  --grad:linear-gradient(90deg,#2B7CC4,#3BB5E8); --wa:#25D366;
  --maxw:1120px; --radius:14px;
  --font-head:'Sora',system-ui,sans-serif; --font-body:'Inter',system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);line-height:1.6;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:var(--font-head);line-height:1.12;font-weight:700}
main{min-height:60vh}
.container{max-width:var(--maxw);margin-inline:auto;padding-inline:20px}
.section{padding:72px 0}
.eyebrow{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:600}
.grad-text{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.muted{color:var(--muted)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}
.sec-title{font-size:clamp(28px,4.5vw,44px);margin-top:10px}
.sec-lead{max-width:640px;margin-top:14px;font-size:17px}
.sub-h{font-family:var(--font-head);font-size:24px;margin:44px 0 18px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:10px;font-weight:600;font-size:15px;transition:transform .15s,opacity .15s;cursor:pointer;border:none;font-family:var(--font-body)}
.btn:hover{transform:translateY(-2px)}
.btn-primary{background:var(--grad);color:#fff}
.btn-ghost{background:transparent;color:var(--text);border:1px solid var(--border)}
.btn-wa{background:var(--wa);color:#06310f}
```

- [ ] **Step 3: Crea los datos de marca/contacto**

Create `src/data/site.ts`:

```ts
export const site = {
  nombre: 'Habid Navarro',
  marca: 'Habid Navarro Bienes Raíces',
  tagline: 'Asesoría inmobiliaria honesta en Guadalajara y Zapopan',
  telefono: '+523921075791',
  telefonoDisplay: '+52 392 107 5791',
  whatsapp: '523921075791',
  whatsappMensaje: 'Hola Habid, me interesa Valle Imperial y quisiera más información.',
  email: 'habid.realestate@gmail.com',
  instagram: 'https://instagram.com/habid.realestate',
  instagramHandle: '@habid.realestate',
  facebook: '', // PENDIENTE: URL de la página de Facebook
  zona: 'Guadalajara y Zapopan, Jalisco',
  url: 'https://habidnavarro.com',
};

export const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/sobre-mi', label: 'Sobre mí' },
  { href: '/contacto', label: 'Contacto' },
];

export function waLink(mensaje: string = site.whatsappMensaje): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
```

- [ ] **Step 4: Crea el logo (SVG)**

Create `src/components/BrandLogo.astro`:

```astro
---
interface Props { height?: number; }
const { height = 30 } = Astro.props;
const w = Math.round(height * 1.6);
---
<span class="brand-logo">
  <svg viewBox="0 0 64 44" width={w} height={height} aria-hidden="true" class="roof">
    <polyline points="5,40 5,23 19,9" fill="none" stroke="#2B7CC4" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />
    <polyline points="15,40 15,21 34,7 53,21 53,40" fill="none" stroke="#3BB5E8" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
  <span class="wm"><b>HABID</b><span class="nv">NAVARRO</span></span>
</span>
<style>
  .brand-logo{display:inline-flex;align-items:center;gap:10px}
  .wm{font-family:var(--font-head);letter-spacing:.04em;font-size:18px;display:inline-flex;gap:7px;align-items:baseline}
  .wm b{color:#fff;font-weight:800}
  .nv{color:#9AA6B2;font-weight:600}
</style>
```

- [ ] **Step 5: Crea el componente SEO (head)**

Create `src/components/SEO.astro`:

```astro
---
import { site } from '../data/site';
interface Props { title: string; description?: string; image?: string; }
const { title, description = site.tagline, image = '/img/og-default.jpg' } = Astro.props;
const fullTitle = title === site.marca ? title : `${title} · ${site.marca}`;
const base = Astro.site ?? new URL(site.url);
const canonical = new URL(Astro.url.pathname, base).href;
const ogImage = new URL(image, base).href;
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content={site.marca} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImage} />
<meta property="og:url" content={canonical} />
<meta property="og:locale" content="es_MX" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" />
```

- [ ] **Step 6: Crea la navegación**

Create `src/components/Nav.astro`:

```astro
---
import { nav, site } from '../data/site';
import BrandLogo from './BrandLogo.astro';
const path = Astro.url.pathname;
const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
---
<header class="nav">
  <div class="container nav-inner">
    <a href="/" class="brand" aria-label={site.marca}><BrandLogo height={28} /></a>
    <nav class="nav-links" aria-label="Principal">
      {nav.map((item) => (
        <a href={item.href} class:list={['nav-link', { active: isActive(item.href) }]}>{item.label}</a>
      ))}
    </nav>
    <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false">☰</button>
  </div>
</header>
<style>
  .nav{position:sticky;top:0;z-index:50;background:rgba(11,15,20,.82);backdrop-filter:blur(10px);border-bottom:1px solid var(--border)}
  .nav-inner{display:flex;align-items:center;justify-content:space-between;height:68px}
  .nav-links{display:flex;gap:28px}
  .nav-link{font-size:15px;color:var(--muted);font-weight:500}
  .nav-link:hover,.nav-link.active{color:var(--text)}
  .nav-toggle{display:none;background:none;border:none;color:var(--text);font-size:22px;cursor:pointer}
  @media(max-width:760px){
    .nav-links{position:fixed;inset:68px 0 auto 0;flex-direction:column;background:var(--surface);padding:18px 20px;gap:16px;border-bottom:1px solid var(--border);transform:translateY(-130%);transition:transform .25s}
    .nav-links.open{transform:translateY(0)}
    .nav-toggle{display:block}
  }
</style>
<script>
  const t = document.querySelector('.nav-toggle');
  const l = document.querySelector('.nav-links');
  t?.addEventListener('click', () => {
    const open = l?.classList.toggle('open');
    t.setAttribute('aria-expanded', String(!!open));
  });
</script>
```

- [ ] **Step 7: Crea el footer**

Create `src/components/Footer.astro`:

```astro
---
import { site, waLink } from '../data/site';
import BrandLogo from './BrandLogo.astro';
const year = new Date().getFullYear();
---
<footer class="footer">
  <div class="container footer-grid">
    <div>
      <BrandLogo height={30} />
      <p class="muted footer-tag">{site.tagline}</p>
    </div>
    <div class="footer-col">
      <h3 class="footer-h">Contacto</h3>
      <a href={waLink()} target="_blank" rel="noopener">WhatsApp</a>
      <a href={`tel:${site.telefono}`}>{site.telefonoDisplay}</a>
      <a href={`mailto:${site.email}`}>{site.email}</a>
    </div>
    <div class="footer-col">
      <h3 class="footer-h">Sígueme</h3>
      <a href={site.instagram} target="_blank" rel="noopener">Instagram {site.instagramHandle}</a>
      {site.facebook
        ? <a href={site.facebook} target="_blank" rel="noopener">Facebook</a>
        : <span class="muted">Facebook (próximamente)</span>}
    </div>
  </div>
  <div class="container footer-bottom">
    <span class="muted">© {year} {site.marca}. {site.zona}.</span>
    <a href="/aviso-de-privacidad" class="muted">Aviso de privacidad</a>
  </div>
</footer>
<style>
  .footer{border-top:1px solid var(--border);background:var(--surface-2);margin-top:40px}
  .footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:30px;padding:48px 20px 28px}
  .footer-tag{margin-top:12px;max-width:260px}
  .footer-col{display:flex;flex-direction:column;gap:10px}
  .footer-h{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:4px}
  .footer-col a:hover{color:var(--accent)}
  .footer-bottom{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:18px 20px;border-top:1px solid var(--border);font-size:14px}
  @media(max-width:680px){.footer-grid{grid-template-columns:1fr;gap:24px}}
</style>
```

- [ ] **Step 8: Crea el botón flotante de WhatsApp**

Create `src/components/WhatsAppFab.astro`:

```astro
---
import { waLink } from '../data/site';
---
<a class="wa-fab" href={waLink()} target="_blank" rel="noopener" aria-label="Escríbeme por WhatsApp">
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.69.25-1.29.18-1.41-.07-.12-.27-.2-.57-.35M12.05 21.78h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.89 6.99c0 5.45-4.43 9.88-9.88 9.88M20.52 3.45A11.82 11.82 0 0012.05 0C5.46 0 .1 5.33.1 11.89c0 2.1.55 4.14 1.6 5.95L0 24l6.3-1.65a11.96 11.96 0 005.71 1.45h.01c6.58 0 11.94-5.33 11.94-11.89a11.86 11.86 0 00-3.44-8.46" />
  </svg>
  <span class="wa-fab-text">WhatsApp</span>
</a>
<style>
  .wa-fab{position:fixed;right:18px;bottom:18px;z-index:60;display:inline-flex;align-items:center;gap:8px;background:var(--wa);color:#06310f;padding:13px 18px;border-radius:50px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.4);transition:transform .15s}
  .wa-fab:hover{transform:translateY(-2px)}
  @media(max-width:520px){.wa-fab-text{display:none}.wa-fab{padding:14px}}
</style>
```

- [ ] **Step 9: Crea el BaseLayout**

Create `src/layouts/BaseLayout.astro`:

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
<html lang="es">
  <head>
    <SEO title={title} description={description} image={image} />
  </head>
  <body>
    <Nav />
    <main><slot /></main>
    <Footer />
    <WhatsAppFab />
  </body>
</html>
```

- [ ] **Step 10: Reemplaza la home temporal para usar el layout**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../data/site';
---
<BaseLayout title={site.marca}>
  <section class="section"><div class="container"><h1 class="sec-title">Habid Navarro</h1></div></section>
</BaseLayout>
```

- [ ] **Step 11: Corre las pruebas**

Run: `npm test`
Expected: build OK; pasan las 5 pruebas (OG, nav, WhatsApp fab, footer, dist).

- [ ] **Step 12: Commit**

```bash
git add src/styles src/data/site.ts src/components src/layouts src/pages/index.astro tests/site.test.mjs
git commit -m "feat: shell del sitio (layout, nav, footer, WhatsApp, SEO, tokens)"
```

---

### Task 3: Datos de propiedades + componentes de propiedad

**Files:**
- Create: `src/data/propiedades.ts`, `src/components/Hero.astro`, `src/components/PropertyCard.astro`, `src/components/KeyFacts.astro`, `src/components/AmenityGrid.astro`, `src/components/Gallery.astro`, `src/components/CtaBand.astro`

- [ ] **Step 1: Crea los datos de propiedades (con placeholders `****`)**

Create `src/data/propiedades.ts`:

```ts
export interface Propiedad {
  slug: string;
  nombre: string;
  estado: 'En venta' | 'Apartado' | 'Vendido';
  destacada: boolean;
  tipo: string;
  precio: string;
  superficie: string;
  ubicacion: string;
  municipio: string;
  entidad: string;
  amenidades: string[];
  galeria: string[];
  resumen: string;
  descripcion: string[];
  mapaEmbed: string;
}

export const propiedades: Propiedad[] = [
  {
    slug: 'valle-imperial',
    nombre: 'Valle Imperial',
    estado: 'En venta',
    destacada: true,
    tipo: '****',
    precio: '****',
    superficie: '****',
    ubicacion: '****',
    municipio: 'Zapopan',
    entidad: 'Jalisco',
    amenidades: ['Cinemex', 'Alberca', 'Salón de eventos', 'Áreas verdes'],
    galeria: [
      '/img/placeholder/valle-1.jpg',
      '/img/placeholder/valle-2.jpg',
      '/img/placeholder/valle-3.jpg',
      '/img/placeholder/valle-4.jpg',
    ],
    resumen: 'Último terreno a la venta en una comunidad privada con amenidades de primer nivel en Zapopan.',
    descripcion: [
      'Valle Imperial es una comunidad privada en Zapopan pensada para vivir distinto: amenidades de primer nivel, áreas verdes y excelente plusvalía.',
      'Esta es la oportunidad de adquirir el último terreno disponible en el desarrollo. Los datos de precio, superficie y ubicación exacta se actualizarán próximamente.',
    ],
    mapaEmbed: '',
  },
];

export const propiedadDestacada: Propiedad = propiedades.find((p) => p.destacada) ?? propiedades[0];
export const getPropiedad = (slug: string): Propiedad | undefined => propiedades.find((p) => p.slug === slug);
```

- [ ] **Step 2: Crea el Hero**

Create `src/components/Hero.astro`:

```astro
---
import { propiedadDestacada } from '../data/propiedades';
import { waLink } from '../data/site';
const p = propiedadDestacada;
---
<section class="hero">
  <div class="hero-bg" style={`background-image:linear-gradient(90deg,var(--bg) 32%,rgba(11,15,20,.4)),url(${p.galeria[0]})`}></div>
  <div class="container hero-inner">
    <p class="eyebrow">Último terreno a la venta · {p.municipio}</p>
    <h1 class="hero-title grad-text">{p.nombre}</h1>
    <p class="hero-sub muted">{p.resumen}</p>
    <div class="hero-cta">
      <a class="btn btn-primary" href={`/propiedades/${p.slug}`}>Ver la propiedad</a>
      <a class="btn btn-wa" href={waLink()} target="_blank" rel="noopener">Agendar una visita</a>
    </div>
  </div>
</section>
<style>
  .hero{position:relative;min-height:78vh;display:flex;align-items:center;overflow:hidden}
  .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center right;z-index:0}
  .hero-inner{position:relative;z-index:1;padding-block:60px}
  .hero-title{font-size:clamp(44px,9vw,92px);font-weight:800;margin:10px 0;letter-spacing:-.02em}
  .hero-sub{max-width:440px;font-size:18px}
  .hero-cta{display:flex;gap:14px;margin-top:28px;flex-wrap:wrap}
</style>
```

- [ ] **Step 3: Crea PropertyCard**

Create `src/components/PropertyCard.astro`:

```astro
---
import type { Propiedad } from '../data/propiedades';
interface Props { propiedad: Propiedad; }
const { propiedad: p } = Astro.props;
---
<a class="pcard card" href={`/propiedades/${p.slug}`}>
  <div class="pcard-img">
    <img src={p.galeria[0]} alt={p.nombre} loading="lazy" />
    <span class="pcard-badge">{p.estado}</span>
  </div>
  <div class="pcard-body">
    <h3>{p.nombre}</h3>
    <p class="muted">{p.municipio}, {p.entidad}</p>
    <p class="pcard-price grad-text">{p.precio}</p>
  </div>
</a>
<style>
  .pcard{overflow:hidden;display:block;transition:transform .15s,border-color .15s}
  .pcard:hover{transform:translateY(-4px);border-color:var(--accent-2)}
  .pcard-img{position:relative;aspect-ratio:16/10;overflow:hidden}
  .pcard-img img{width:100%;height:100%;object-fit:cover}
  .pcard-badge{position:absolute;top:12px;left:12px;background:var(--grad);color:#fff;font-size:12px;font-weight:600;padding:5px 12px;border-radius:30px}
  .pcard-body{padding:18px}
  .pcard-body h3{font-size:20px}
  .pcard-body .muted{margin:4px 0 10px;font-size:14px}
  .pcard-price{font-family:var(--font-head);font-weight:700;font-size:19px}
</style>
```

- [ ] **Step 4: Crea KeyFacts**

Create `src/components/KeyFacts.astro`:

```astro
---
interface Props { precio: string; superficie: string; tipo: string; ubicacion: string; municipio: string; }
const { precio, superficie, tipo, ubicacion, municipio } = Astro.props;
const PEND = '****';
const items = [
  { label: 'Precio', value: precio },
  { label: 'Superficie', value: superficie === PEND ? PEND : `${superficie} m²` },
  { label: 'Tipo', value: tipo },
  { label: 'Ubicación', value: ubicacion === PEND ? PEND : `${ubicacion}, ${municipio}` },
];
---
<div class="keyfacts">
  {items.map((i) => (
    <div class="kf card">
      <span class="kf-label muted">{i.label}</span>
      <span class={`kf-value ${i.value === PEND ? 'kf-pend' : ''}`}>{i.value}</span>
    </div>
  ))}
</div>
<style>
  .keyfacts{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .kf{padding:18px;display:flex;flex-direction:column;gap:6px}
  .kf-label{font-size:12px;letter-spacing:.1em;text-transform:uppercase}
  .kf-value{font-family:var(--font-head);font-size:20px;font-weight:700}
  .kf-pend{color:var(--accent);opacity:.85}
  @media(max-width:680px){.keyfacts{grid-template-columns:repeat(2,1fr)}}
</style>
```

- [ ] **Step 5: Crea AmenityGrid**

Create `src/components/AmenityGrid.astro`:

```astro
---
interface Props { amenidades: string[]; }
const { amenidades } = Astro.props;
function icon(a: string): string {
  const k = a.toLowerCase();
  if (k.includes('alberca')) return '🏊';
  if (k.includes('cine')) return '🎬';
  if (k.includes('salón') || k.includes('salon') || k.includes('evento')) return '🎉';
  if (k.includes('verde') || k.includes('área') || k.includes('area')) return '🌳';
  if (k.includes('segur') || k.includes('caseta')) return '🛡️';
  if (k.includes('gim')) return '🏋️';
  return '✨';
}
---
<div class="amenities">
  {amenidades.map((a) => (
    <div class="amenity card">
      <span class="amenity-ico" aria-hidden="true">{icon(a)}</span>
      <span class="amenity-name">{a}</span>
    </div>
  ))}
</div>
<style>
  .amenities{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
  .amenity{padding:18px;display:flex;align-items:center;gap:12px}
  .amenity-ico{font-size:24px}
  .amenity-name{font-weight:500}
</style>
```

- [ ] **Step 6: Crea Gallery**

Create `src/components/Gallery.astro`:

```astro
---
interface Props { imagenes: string[]; alt: string; }
const { imagenes, alt } = Astro.props;
---
<div class="gallery">
  {imagenes.map((src, i) => (
    <a href={src} class={`g-item ${i === 0 ? 'g-lead' : ''}`} target="_blank" rel="noopener" aria-label={`${alt} — foto ${i + 1}`}>
      <img src={src} alt={`${alt} — foto ${i + 1}`} loading="lazy" />
    </a>
  ))}
</div>
<style>
  .gallery{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:180px;gap:12px}
  .g-item{overflow:hidden;border-radius:12px;border:1px solid var(--border)}
  .g-item img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
  .g-item:hover img{transform:scale(1.05)}
  .g-lead{grid-column:span 2;grid-row:span 2}
  @media(max-width:680px){.gallery{grid-template-columns:repeat(2,1fr);grid-auto-rows:140px}.g-lead{grid-column:span 2;grid-row:span 1}}
</style>
```

- [ ] **Step 7: Crea CtaBand**

Create `src/components/CtaBand.astro`:

```astro
---
import { waLink, site } from '../data/site';
interface Props { titulo?: string; texto?: string; }
const {
  titulo = '¿Te interesa Valle Imperial?',
  texto = 'Escríbeme y con gusto te comparto toda la información y agendamos una visita.',
} = Astro.props;
---
<section class="cta-band">
  <div class="container cta-inner">
    <div>
      <h2 class="cta-title">{titulo}</h2>
      <p class="muted">{texto}</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-wa" href={waLink()} target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn btn-ghost" href={`tel:${site.telefono}`}>Llamar</a>
    </div>
  </div>
</section>
<style>
  .cta-band{border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:linear-gradient(180deg,var(--surface),var(--surface-2))}
  .cta-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:48px 20px;flex-wrap:wrap}
  .cta-title{font-size:clamp(24px,3.5vw,32px)}
  .cta-actions{display:flex;gap:12px;flex-wrap:wrap}
</style>
```

- [ ] **Step 8: Verifica que compila**

Run: `npm test`
Expected: build OK (componentes compilan); siguen pasando las pruebas de Task 2 (los componentes aún no se usan en páginas, así que no hay aserciones nuevas todavía).

- [ ] **Step 9: Commit**

```bash
git add src/data/propiedades.ts src/components
git commit -m "feat: datos de propiedades y componentes (hero, card, keyfacts, amenidades, galería, cta)"
```

---

### Task 4: Página de Inicio

**Files:**
- Modify: `src/pages/index.astro`, `tests/site.test.mjs`

- [ ] **Step 1: Añade la prueba que falla**

Add to `tests/site.test.mjs` (al final):

```js
test('home: muestra Valle Imperial, amenidades y CTA', () => {
  const h = read('index.html');
  assert.match(h, /Valle Imperial/);
  for (const a of ['Cinemex', 'Alberca', 'Salón de eventos', 'Áreas verdes']) {
    assert.ok(h.includes(a), `falta amenidad ${a}`);
  }
  assert.ok(h.includes('Ver la propiedad') || h.includes('Conoce la propiedad'), 'falta CTA a la propiedad');
});
```

- [ ] **Step 2: Implementa la home real**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import AmenityGrid from '../components/AmenityGrid.astro';
import CtaBand from '../components/CtaBand.astro';
import { propiedadDestacada } from '../data/propiedades';
import { site } from '../data/site';
const p = propiedadDestacada;
---
<BaseLayout title={site.marca} description={`${p.nombre} — ${p.resumen}`}>
  <Hero />
  <section class="section">
    <div class="container">
      <p class="eyebrow">Por qué Valle Imperial</p>
      <h2 class="sec-title">Una comunidad pensada para vivir mejor</h2>
      <p class="muted sec-lead">En una de las zonas con mejor plusvalía de Zapopan, Valle Imperial combina amenidades de primer nivel, seguridad y áreas verdes. Esta es tu oportunidad de adquirir el último terreno disponible.</p>
      <div style="margin-top:32px"><AmenityGrid amenidades={p.amenidades} /></div>
      <div style="margin-top:36px"><a class="btn btn-primary" href={`/propiedades/${p.slug}`}>Conoce la propiedad</a></div>
    </div>
  </section>
  <CtaBand />
</BaseLayout>
```

- [ ] **Step 3: Corre las pruebas**

Run: `npm test`
Expected: pasa la nueva prueba "home: muestra Valle Imperial, amenidades y CTA" y las anteriores.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro tests/site.test.mjs
git commit -m "feat: página de inicio"
```

---

### Task 5: Página de Propiedades (listado)

**Files:**
- Create: `src/pages/propiedades/index.astro`
- Modify: `tests/site.test.mjs`

- [ ] **Step 1: Añade la prueba que falla**

Add to `tests/site.test.mjs`:

```js
test('propiedades: lista con tarjeta a Valle Imperial', () => {
  assert.ok(exists('propiedades/index.html'), 'falta /propiedades');
  const h = read('propiedades/index.html');
  assert.match(h, /href="\/propiedades\/valle-imperial"/);
  assert.match(h, /En venta/);
});
```

- [ ] **Step 2: Implementa el listado**

Create `src/pages/propiedades/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PropertyCard from '../../components/PropertyCard.astro';
import { propiedades } from '../../data/propiedades';
---
<BaseLayout title="Propiedades" description="Propiedades disponibles con Habid Navarro Bienes Raíces.">
  <section class="section">
    <div class="container">
      <p class="eyebrow">Propiedades</p>
      <h1 class="sec-title">Disponibles ahora</h1>
      <div class="pgrid">
        {propiedades.map((p) => <PropertyCard propiedad={p} />)}
      </div>
    </div>
  </section>
</BaseLayout>
<style>
  .pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px;margin-top:32px}
</style>
```

- [ ] **Step 3: Corre las pruebas**

Run: `npm test`
Expected: pasa "propiedades: lista con tarjeta a Valle Imperial".

- [ ] **Step 4: Commit**

```bash
git add src/pages/propiedades/index.astro tests/site.test.mjs
git commit -m "feat: página de listado de propiedades"
```

---

### Task 6: Ficha de propiedad (Valle Imperial)

**Files:**
- Create: `src/pages/propiedades/[slug].astro`
- Modify: `tests/site.test.mjs`

- [ ] **Step 1: Añade la prueba que falla**

Add to `tests/site.test.mjs`:

```js
test('ficha: datos clave con placeholders, amenidades y descripción', () => {
  assert.ok(exists('propiedades/valle-imperial/index.html'), 'falta la ficha');
  const h = read('propiedades/valle-imperial/index.html');
  assert.ok(h.includes('****'), 'deben verse los datos pendientes ****');
  assert.match(h, /Precio/);
  assert.match(h, /Amenidades/);
  assert.match(h, /comunidad privada en Zapopan/);
});
```

- [ ] **Step 2: Implementa la ficha**

Create `src/pages/propiedades/[slug].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import KeyFacts from '../../components/KeyFacts.astro';
import AmenityGrid from '../../components/AmenityGrid.astro';
import Gallery from '../../components/Gallery.astro';
import CtaBand from '../../components/CtaBand.astro';
import { propiedades, type Propiedad } from '../../data/propiedades';

export function getStaticPaths() {
  return propiedades.map((p) => ({ params: { slug: p.slug }, props: { p } }));
}
interface Props { p: Propiedad; }
const { p } = Astro.props;
---
<BaseLayout title={p.nombre} description={p.resumen} image={p.galeria[0]}>
  <section class="section">
    <div class="container">
      <p class="eyebrow">{p.estado} · {p.municipio}, {p.entidad}</p>
      <h1 class="sec-title">{p.nombre}</h1>
      <div style="margin-top:24px"><Gallery imagenes={p.galeria} alt={p.nombre} /></div>
      <div style="margin-top:28px"><KeyFacts precio={p.precio} superficie={p.superficie} tipo={p.tipo} ubicacion={p.ubicacion} municipio={p.municipio} /></div>
      <div class="detail-desc">
        {p.descripcion.map((par) => <p>{par}</p>)}
      </div>
      <h2 class="sub-h">Amenidades</h2>
      <AmenityGrid amenidades={p.amenidades} />
      {p.mapaEmbed
        ? <div class="mapwrap" set:html={p.mapaEmbed}></div>
        : <p class="muted map-pending">📍 Ubicación exacta y mapa: por actualizar.</p>}
    </div>
  </section>
  <CtaBand titulo={`¿Quieres más información de ${p.nombre}?`} />
</BaseLayout>
<style>
  .detail-desc{max-width:720px;margin-top:30px;display:flex;flex-direction:column;gap:14px;font-size:17px}
  .map-pending{margin-top:24px;padding:18px;border:1px dashed var(--border);border-radius:12px}
  .mapwrap{margin-top:24px;border-radius:12px;overflow:hidden}
  .mapwrap :global(iframe){width:100%;min-height:360px;border:0;display:block}
</style>
```

- [ ] **Step 3: Corre las pruebas**

Run: `npm test`
Expected: pasa "ficha: datos clave con placeholders, amenidades y descripción".

- [ ] **Step 4: Commit**

```bash
git add src/pages/propiedades/[slug].astro tests/site.test.mjs
git commit -m "feat: ficha de propiedad Valle Imperial"
```

---

### Task 7: Página Sobre mí

**Files:**
- Create: `src/pages/sobre-mi.astro`
- Modify: `tests/site.test.mjs`

- [ ] **Step 1: Añade la prueba que falla**

Add to `tests/site.test.mjs`:

```js
test('sobre-mi: bio presente y SIN mención de cédula', () => {
  assert.ok(exists('sobre-mi/index.html'), 'falta /sobre-mi');
  const h = read('sobre-mi/index.html');
  assert.match(h, /asesor inmobiliario en Guadalajara y Zapopan/);
  assert.doesNotMatch(h.toLowerCase(), /c[eé]dula/);
});
```

- [ ] **Step 2: Implementa la página**

Create `src/pages/sobre-mi.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import CtaBand from '../components/CtaBand.astro';
import { site } from '../data/site';
---
<BaseLayout title="Sobre mí" description={site.tagline}>
  <section class="section">
    <div class="container about">
      <div class="about-photo card"><img src="/img/placeholder/habid.svg" alt="Habid Navarro" /></div>
      <div class="about-text">
        <p class="eyebrow">Sobre mí</p>
        <h1 class="sec-title">Habid Navarro</h1>
        <p class="about-tag muted">{site.tagline}</p>
        <p>Soy Habid Navarro, asesor inmobiliario en Guadalajara y Zapopan. Acompaño a mis clientes a encontrar el terreno o la propiedad correcta para invertir y vivir mejor, con asesoría honesta y cero presión —desde la primera visita hasta la firma.</p>
        <p>Conozco a fondo las zonas de mayor plusvalía de la Zona Metropolitana de Guadalajara y trabajo con desarrollos de primer nivel como Valle Imperial. Mi compromiso es simple: información clara, trato cercano y una decisión de inversión fácil y segura.</p>
        <a class="btn btn-primary" href="/contacto">Hablemos</a>
      </div>
    </div>
  </section>
  <CtaBand />
</BaseLayout>
<style>
  .about{display:grid;grid-template-columns:0.8fr 1.2fr;gap:40px;align-items:start}
  .about-photo{overflow:hidden;aspect-ratio:4/5}
  .about-photo img{width:100%;height:100%;object-fit:cover}
  .about-text{display:flex;flex-direction:column;gap:16px}
  .about-text p{font-size:17px}
  .about-tag{font-size:18px;margin-top:-4px}
  .about-text .btn{align-self:flex-start;margin-top:6px}
  @media(max-width:760px){.about{grid-template-columns:1fr;gap:24px}.about-photo{max-width:280px}}
</style>
```

- [ ] **Step 3: Corre las pruebas**

Run: `npm test`
Expected: pasa "sobre-mi: bio presente y SIN mención de cédula".

- [ ] **Step 4: Commit**

```bash
git add src/pages/sobre-mi.astro tests/site.test.mjs
git commit -m "feat: página sobre mí"
```

---

### Task 8: Página de Contacto

**Files:**
- Create: `src/pages/contacto.astro`
- Modify: `tests/site.test.mjs`

- [ ] **Step 1: Añade la prueba que falla**

Add to `tests/site.test.mjs`:

```js
test('contacto: enlaces de WhatsApp, llamada, correo e Instagram', () => {
  assert.ok(exists('contacto/index.html'), 'falta /contacto');
  const h = read('contacto/index.html');
  assert.match(h, /wa\.me\/523921075791/);
  assert.match(h, /tel:\+523921075791/);
  assert.match(h, /mailto:habid\.realestate@gmail\.com/);
  assert.match(h, /instagram\.com\/habid\.realestate/);
});
```

- [ ] **Step 2: Implementa la página**

Create `src/pages/contacto.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site, waLink } from '../data/site';
---
<BaseLayout title="Contacto" description={`Contacta a ${site.marca}.`}>
  <section class="section">
    <div class="container">
      <p class="eyebrow">Contacto</p>
      <h1 class="sec-title">Hablemos</h1>
      <p class="muted sec-lead">Estoy para asesorarte. Escríbeme por el medio que prefieras y te respondo a la brevedad.</p>
      <div class="contact-grid">
        <a class="contact-card card" href={waLink()} target="_blank" rel="noopener">
          <span class="cc-ico">🟢</span><span class="cc-label">WhatsApp</span><span class="muted">{site.telefonoDisplay}</span>
        </a>
        <a class="contact-card card" href={`tel:${site.telefono}`}>
          <span class="cc-ico">📞</span><span class="cc-label">Llamar</span><span class="muted">{site.telefonoDisplay}</span>
        </a>
        <a class="contact-card card" href={`mailto:${site.email}`}>
          <span class="cc-ico">✉️</span><span class="cc-label">Correo</span><span class="muted">{site.email}</span>
        </a>
        <a class="contact-card card" href={site.instagram} target="_blank" rel="noopener">
          <span class="cc-ico">📸</span><span class="cc-label">Instagram</span><span class="muted">{site.instagramHandle}</span>
        </a>
      </div>
      <p class="muted zona">Zona de servicio: {site.zona}</p>
    </div>
  </section>
</BaseLayout>
<style>
  .contact-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:32px}
  .contact-card{padding:26px 22px;display:flex;flex-direction:column;gap:6px;transition:transform .15s,border-color .15s}
  .contact-card:hover{transform:translateY(-3px);border-color:var(--accent-2)}
  .cc-ico{font-size:28px}
  .cc-label{font-family:var(--font-head);font-weight:700;font-size:18px}
  .zona{margin-top:28px}
</style>
```

- [ ] **Step 3: Corre las pruebas**

Run: `npm test`
Expected: pasa "contacto: enlaces de WhatsApp, llamada, correo e Instagram".

- [ ] **Step 4: Commit**

```bash
git add src/pages/contacto.astro tests/site.test.mjs
git commit -m "feat: página de contacto"
```

---

### Task 9: Aviso de privacidad

**Files:**
- Create: `src/pages/aviso-de-privacidad.astro`
- Modify: `tests/site.test.mjs`

- [ ] **Step 1: Añade la prueba que falla**

Add to `tests/site.test.mjs`:

```js
test('aviso de privacidad existe y menciona derechos ARCO', () => {
  assert.ok(exists('aviso-de-privacidad/index.html'), 'falta /aviso-de-privacidad');
  assert.match(read('aviso-de-privacidad/index.html'), /ARCO/);
});
```

- [ ] **Step 2: Implementa la página**

Create `src/pages/aviso-de-privacidad.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../data/site';
---
<BaseLayout title="Aviso de privacidad" description="Aviso de privacidad de Habid Navarro Bienes Raíces.">
  <section class="section">
    <div class="container legal">
      <h1 class="sec-title">Aviso de privacidad</h1>
      <p>En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, {site.marca} (“el Responsable”) informa lo siguiente:</p>
      <h2 class="sub-h">Datos que recabamos</h2>
      <p>Cuando nos contactas por WhatsApp, llamada o correo, podemos recabar tu nombre, teléfono y correo electrónico, con la única finalidad de atender tu solicitud y brindarte información sobre propiedades.</p>
      <h2 class="sub-h">Uso de tus datos</h2>
      <p>Tus datos se utilizan exclusivamente para responder tu consulta y darte seguimiento. No los compartimos ni vendemos a terceros.</p>
      <h2 class="sub-h">Tus derechos (ARCO)</h2>
      <p>Puedes solicitar el acceso, rectificación, cancelación u oposición al uso de tus datos escribiendo a <a class="lnk" href={`mailto:${site.email}`}>{site.email}</a>.</p>
      <p class="muted upd">Última actualización: junio de 2026.</p>
    </div>
  </section>
</BaseLayout>
<style>
  .legal{max-width:760px}
  .legal p{font-size:16px;margin-top:8px}
  .legal .lnk{color:var(--accent)}
  .upd{margin-top:28px}
</style>
```

- [ ] **Step 3: Corre las pruebas**

Run: `npm test`
Expected: pasa "aviso de privacidad existe y menciona derechos ARCO".

- [ ] **Step 4: Commit**

```bash
git add src/pages/aviso-de-privacidad.astro tests/site.test.mjs
git commit -m "feat: aviso de privacidad"
```

---

### Task 10: Assets (favicon, imágenes de muestra, OG, robots)

**Files:**
- Create: `public/favicon.svg`, `public/robots.txt`, `public/img/placeholder/habid.svg`, `public/img/placeholder/valle-1.jpg`..`valle-4.jpg`, `public/img/og-default.jpg`
- Modify: `tests/site.test.mjs`

- [ ] **Step 1: Añade la prueba que falla**

Add to `tests/site.test.mjs`:

```js
test('assets: favicon, og e imágenes de muestra presentes en dist', () => {
  assert.ok(exists('favicon.svg'), 'falta favicon.svg');
  assert.ok(exists('robots.txt'), 'falta robots.txt');
  assert.ok(exists('img/og-default.jpg'), 'falta og-default.jpg');
  assert.ok(exists('img/placeholder/valle-1.jpg'), 'falta valle-1.jpg');
  assert.ok(exists('img/placeholder/habid.svg'), 'falta habid.svg');
});

test('sitemap generado', () => {
  assert.ok(exists('sitemap-index.xml') || exists('sitemap-0.xml'), 'falta sitemap');
});
```

- [ ] **Step 2: Crea el favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0B0F14"/>
  <polyline points="13,50 13,29 27,17" fill="none" stroke="#2B7CC4" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
  <polyline points="23,50 23,27 39,15 54,27 54,50" fill="none" stroke="#3BB5E8" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Crea robots.txt**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://habidnavarro.com/sitemap-index.xml
```

- [ ] **Step 4: Crea el placeholder de foto de Habid**

Create `public/img/placeholder/habid.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <rect width="400" height="500" fill="#11161C"/>
  <circle cx="200" cy="200" r="70" fill="#1C2630"/>
  <path d="M90 430c0-70 50-120 110-120s110 50 110 120z" fill="#1C2630"/>
  <text x="200" y="475" text-anchor="middle" fill="#9AA6B2" font-family="system-ui,sans-serif" font-size="20">Foto por agregar</text>
</svg>
```

- [ ] **Step 5: Descarga imágenes de muestra (con respaldo si no hay red)**

Run (descarga fotos de muestra de arquitectura/residencial desde Unsplash):

```bash
mkdir -p public/img/placeholder
curl -L -o public/img/placeholder/valle-1.jpg "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80&fm=jpg&fit=crop"
curl -L -o public/img/placeholder/valle-2.jpg "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80&fm=jpg&fit=crop"
curl -L -o public/img/placeholder/valle-3.jpg "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80&fm=jpg&fit=crop"
curl -L -o public/img/placeholder/valle-4.jpg "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80&fm=jpg&fit=crop"
curl -L -o public/img/og-default.jpg "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=630&q=80&fm=jpg&fit=crop"
```

Verifica que cada archivo pese > 10 KB: `ls -l public/img/placeholder public/img/og-default.jpg`

**Respaldo si curl falla o no hay red:** crea SVGs de muestra en su lugar (mismos nombres con extensión `.jpg` sustituyéndolos por SVG no funciona en `<img src=.jpg>`; en su lugar genera JPEGs sólidos). Comando de respaldo con Node (sin dependencias):

```bash
node -e "const fs=require('fs');const mk=(p)=>{const w=1600,h=1000;const head=Buffer.from([0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,0x01,0x00,0x00,0x01,0x00,0x01,0x00,0x00,0xFF,0xD9]);fs.writeFileSync(p,head);};['valle-1','valle-2','valle-3','valle-4'].forEach(n=>mk('public/img/placeholder/'+n+'.jpg'));mk('public/img/og-default.jpg');console.log('placeholders JPEG mínimos creados');"
```

(Si usas el respaldo, anótalo: las imágenes se verán vacías hasta que Habid suba fotos reales — el sitio igual compila y funciona.)

- [ ] **Step 6: Corre las pruebas**

Run: `npm test`
Expected: pasan "assets: ... presentes en dist" y "sitemap generado".

- [ ] **Step 7: Commit**

```bash
git add public/favicon.svg public/robots.txt public/img tests/site.test.mjs
git commit -m "feat: favicon, robots, imágenes de muestra y OG"
```

---

### Task 11: Verificación final, README y notas de despliegue

**Files:**
- Create: `README.md`
- Modify: (ninguno de código)

- [ ] **Step 1: Corre toda la suite**

Run: `npm test`
Expected: TODAS las pruebas pasan (rutas, WhatsApp, nav/footer, OG, home, listado, ficha, sobre-mí, contacto, aviso, assets, sitemap).

- [ ] **Step 2: Revisión visual en navegador**

Run: `npm run preview`
Expected: Astro sirve `dist/` (típicamente en http://localhost:4321). Abre y revisa en escritorio y en vista móvil (DevTools): hero, navegación (incluido el menú hamburguesa en móvil), botón flotante de WhatsApp, las 5 páginas, footer. Detén con Ctrl+C.

- [ ] **Step 3: Escribe el README con instrucciones**

Create `README.md`:

```markdown
# Habid Navarro Bienes Raíces — Sitio web

Sitio estático hecho con [Astro](https://astro.build). Estilo "Oscuro Premium".

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:4321
```

## Compilar y probar

```bash
npm run build    # genera dist/
npm test         # compila y valida el HTML generado
npm run preview  # sirve dist/ para revisión
```

## Cómo actualizar contenido

- **Datos de la propiedad (precio, m², ubicación, tipo, mapa):** edita `src/data/propiedades.ts`
  y reemplaza los valores `****` por los reales. Para el mapa, pega el `<iframe>` de Google Maps en `mapaEmbed`.
- **Fotos:** reemplaza los archivos en `public/img/placeholder/` por fotos reales
  (mismos nombres) o agrega nuevas y actualiza `galeria` en `propiedades.ts`.
  Cambia también `public/img/og-default.jpg` (1200×630) por una foto buena para compartir.
- **Foto de Habid:** reemplaza `public/img/placeholder/habid.svg` por una foto real
  (renómbrala a `.jpg`/`.webp`) y actualiza la ruta en `src/pages/sobre-mi.astro`.
- **Contacto / redes:** edita `src/data/site.ts`. Cuando tengas la URL de Facebook,
  ponla en `facebook:` y aparecerá automáticamente.
- **Agregar una propiedad nueva:** copia el objeto dentro de `propiedades` en
  `src/data/propiedades.ts`, cambia `slug` y datos. Se genera su página sola.

## Publicar en Cloudflare Pages (gratis)

1. Sube el repo a GitHub.
2. En el panel de Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** y
   elige el repo.
3. Configuración de build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy. Cada `git push` a la rama principal vuelve a publicar automáticamente.

## Dominio

Recomendado: **habidnavarro.com** vía **Cloudflare Registrar** (~$10 USD/año).
En Cloudflare: **Registrar → Register Domain**, y como el sitio ya vive en Pages, en
**Pages → Custom domains** agrega `habidnavarro.com` (el DNS se configura solo).
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README con uso y despliegue en Cloudflare Pages"
```

- [ ] **Step 5: (Opcional) Pase de pulido visual**

Si se desea más refinamiento estético (microinteracciones, espaciados, jerarquía),
invocar el skill **frontend-design** para una pasada de polish sobre los componentes ya
funcionales, manteniendo verdes las pruebas (`npm test`) tras cada cambio.

---

## Self-Review (hecho por el autor del plan)

**1. Cobertura del spec:**
- §3 Stack (Astro + Cloudflare + sitemap) → Task 1, Task 11 ✓
- §4 Arquitectura de 5 vistas → Tasks 4–9 ✓
- §5 Modelo de contenido (propiedad con `****`) → Task 3 ✓
- §6 Sistema de diseño (tokens, Sora/Inter, componentes) → Task 2, Task 3 ✓
- §7 Bio redactada + descripción → Task 7, Task 3 ✓
- §8 Contacto por enlaces directos + WhatsApp fab → Task 2 (fab/footer), Task 8 ✓
- §9 SEO/OG/favicon/robots/sitemap/aviso de privacidad → Task 2 (SEO), Task 9, Task 10 ✓
- §11 Inventario (Facebook pendiente, foto pendiente) → `site.facebook=''` con fallback, `habid.svg` ✓
- §12 Fuera de alcance respetado (sin backend, sin i18n, sin CMS) ✓

**2. Placeholders:** Los `****` son intencionales y aprobados por el usuario (datos del
terreno); `site.facebook=''` y `habid.svg` tienen *fallbacks* visuales. No hay TODOs sin resolver.

**3. Consistencia de tipos/nombres:** `Propiedad` definido en Task 3 y usado igual en
Tasks 5/6; `waLink()`, `site.*`, `propiedadDestacada`, `getPropiedad` consistentes; rutas
de `dist/` en las pruebas coinciden con el formato `directory` por defecto de Astro.
Imports relativos verificados (`../` en páginas raíz, `../../` en `propiedades/`).

Sin huecos detectados.
```
