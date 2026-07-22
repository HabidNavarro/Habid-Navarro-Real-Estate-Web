import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = (p) => new URL(`../dist/${p}`, import.meta.url);
const read = (p) => readFileSync(dist(p), 'utf8');
const exists = (p) => existsSync(dist(p));

const properties = JSON.parse(readFileSync(new URL('../data/properties.json', import.meta.url), 'utf8'));
const sold = properties.filter((p) => p.status_key === 'vendida');
const available = properties.filter((p) => p.status_key !== 'vendida');

test('el build genera dist/index.html', () => {
  assert.ok(exists('index.html'));
});

test('home: lang es y etiquetas OG', () => {
  const h = read('index.html');
  assert.match(h, /<html lang="es-MX"/);
  assert.match(h, /property="og:title"/);
  assert.match(h, /property="og:image"/);
  assert.match(h, /name="description"/);
});

test('home: navegación visible (sin Sobre mí)', () => {
  const h = read('index.html');
  for (const label of ['Inicio', 'Propiedades', 'Contacto']) {
    assert.ok(h.includes(label), `falta nav "${label}"`);
  }
  assert.ok(!h.includes('href="/sobre-mi"'), '"Sobre mí" no debe enlazarse en la navegación');
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

test('home: hero v2 que lleva al catálogo', () => {
  const h = read('index.html');
  assert.match(h, /href="\/propiedades"/);
  assert.ok(h.includes('Explorar propiedades'), 'falta CTA "Explorar propiedades"');
  assert.ok(h.includes('Decide con claridad'), 'falta el titular del hero v2');
  assert.ok(!h.includes('Estructura de concreto colado'), 'el home no debe listar amenidades');
});

test('propiedades: catálogo con la casa disponible y las vendidas', () => {
  assert.ok(exists('propiedades/index.html'), 'falta /propiedades');
  const h = read('propiedades/index.html');
  assert.match(h, /href="\/propiedades\/casa-ocotlan"/);
  for (const e of ['En venta', 'Vendida']) {
    assert.ok(h.includes(e), `falta el estado "${e}" en el catálogo`);
  }
  assert.ok(!h.includes('>Apartadas<'), 'el filtro no debe ofrecer "Apartadas": ya no hay ninguna');
});

test('solo la casa de Ocotlán está disponible', () => {
  assert.equal(available.length, 1, 'debe haber exactamente una propiedad no vendida');
  assert.equal(available[0].slug, 'casa-ocotlan');
  assert.ok(sold.length > 0, 'debe haber propiedades vendidas para bloquear');
});

test('vendidas: ninguna se enlaza desde el catálogo, el inicio ni la ficha activa', () => {
  const pages = ['propiedades/index.html', 'index.html', 'propiedades/casa-ocotlan/index.html'];
  for (const page of pages) {
    const h = read(page);
    for (const p of sold) {
      assert.ok(!h.includes(`href="/propiedades/${p.slug}"`), `${page} enlaza a la vendida ${p.slug}`);
    }
  }
});

test('vendidas: tarjeta atenuada con botón que abre el aviso', () => {
  const h = read('propiedades/index.html');
  assert.match(h, /class="[^"]*\bis-sold\b/, 'falta la clase is-sold en las tarjetas vendidas');
  assert.match(h, /class="sold-trigger"/, 'falta el botón que abre el aviso');
  for (const p of sold) {
    assert.ok(h.includes(`data-sold-property="${p.name}"`), `falta el disparador de ${p.slug}`);
  }
});

test('aviso de propiedad vendida presente y con salida a la disponible', () => {
  const h = read('propiedades/index.html');
  assert.match(h, /id="sold-modal"/);
  assert.match(h, /id="sold-modal-name"/);
  assert.match(h, /aria-modal="true"/);
  assert.ok(h.includes('privacidad del cliente'), 'falta el motivo del retiro de datos');
  assert.ok(h.includes('href="/propiedades/casa-ocotlan"'), 'el aviso debe ofrecer la propiedad disponible');
});

test('fichas vendidas con noindex; la disponible indexable', () => {
  for (const p of sold) {
    const h = read(`propiedades/${p.slug}/index.html`);
    assert.match(h, /name="robots" content="noindex,nofollow"/, `${p.slug} debe llevar noindex`);
    assert.ok(!h.includes('rel="canonical"'), `${p.slug} no debe declarar canonical`);
  }
  const activa = read('propiedades/casa-ocotlan/index.html');
  assert.ok(!activa.includes('noindex'), 'la ficha de Ocotlán no debe llevar noindex');
  assert.match(activa, /rel="canonical"/);
});

test('sitemap sin las fichas vendidas', () => {
  const file = exists('sitemap-0.xml') ? 'sitemap-0.xml' : 'sitemap-index.xml';
  const h = read(file);
  for (const p of sold) {
    assert.ok(!h.includes(`/propiedades/${p.slug}`), `${p.slug} no debe estar en el sitemap`);
  }
});

test('catálogo: filtros y estado vacío presentes', () => {
  const h = read('propiedades/index.html');
  assert.match(h, /id="property-search"/);
  assert.match(h, /id="property-status"/);
  assert.match(h, /id="property-municipality"/);
  assert.match(h, /id="no-results"/);
  assert.match(h, /data-filter-card/);
});

test('ficha: datos clave, características y descripción', () => {
  assert.ok(exists('propiedades/casa-ocotlan/index.html'), 'falta la ficha');
  const h = read('propiedades/casa-ocotlan/index.html');
  assert.match(h, /\$2,500,000/);
  assert.match(h, /Precio publicado/);
  assert.match(h, /Características/);
  assert.match(h, /concreto colado/);
  assert.match(h, /id="lightbox"/);
});

test('sobre-mi: la página ya no existe', () => {
  assert.ok(!exists('sobre-mi/index.html'), '/sobre-mi debe estar eliminada');
});

test('contacto: enlaces de WhatsApp, llamada, correo e Instagram', () => {
  assert.ok(exists('contacto/index.html'), 'falta /contacto');
  const h = read('contacto/index.html');
  assert.match(h, /wa\.me\/523921075791/);
  assert.match(h, /tel:\+523921075791/);
  assert.match(h, /mailto:habid\.realestate@gmail\.com/);
  assert.match(h, /instagram\.com\/habid\.realestate/);
});

test('aviso de privacidad existe y menciona derechos ARCO', () => {
  assert.ok(exists('aviso-de-privacidad/index.html'), 'falta /aviso-de-privacidad');
  assert.match(read('aviso-de-privacidad/index.html'), /ARCO/);
});

test('assets: favicon, og, marca e imágenes presentes en dist', () => {
  assert.ok(exists('favicon.svg'), 'falta favicon.svg');
  assert.ok(exists('robots.txt'), 'falta robots.txt');
  assert.ok(exists('img/og-default.jpg'), 'falta og-default.jpg');
  assert.ok(exists('img/ocotlan/ocotlan-1.jpg'), 'falta ocotlan-1.jpg');
  assert.ok(exists('img/brand/logo-horizontal.svg'), 'falta logo horizontal');
  assert.ok(exists('img/brand/logo-mark.svg'), 'falta logo mark');
  assert.ok(exists('img/ui/no-photo.svg'), 'falta no-photo.svg');
  assert.ok(exists('js/app.js'), 'falta app.js');
  assert.ok(exists('404.html'), 'falta 404.html');
});

test('sitemap generado', () => {
  assert.ok(exists('sitemap-index.xml') || exists('sitemap-0.xml'), 'falta sitemap');
});

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
