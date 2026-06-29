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

test('home: hero minimal que lleva al catálogo', () => {
  const h = read('index.html');
  assert.match(h, /href="\/propiedades"/);
  assert.ok(h.includes('Ver propiedades'), 'falta CTA "Ver propiedades"');
  assert.ok(!h.includes('Estructura de concreto colado'), 'el home no debe listar amenidades');
});

test('propiedades: catálogo con varias casas y estados', () => {
  assert.ok(exists('propiedades/index.html'), 'falta /propiedades');
  const h = read('propiedades/index.html');
  assert.match(h, /href="\/propiedades\/casa-ocotlan"/);
  assert.match(h, /href="\/propiedades\/casa-zapopan"/);
  for (const e of ['En venta', 'Apartada', 'Vendida']) {
    assert.ok(h.includes(e), `falta el estado "${e}" en el catálogo`);
  }
});

test('ficha: datos clave, amenidades y descripción', () => {
  assert.ok(exists('propiedades/casa-ocotlan/index.html'), 'falta la ficha');
  const h = read('propiedades/casa-ocotlan/index.html');
  assert.match(h, /\$2,500,000/);
  assert.match(h, /Precio/);
  assert.match(h, /Amenidades/);
  assert.match(h, /concreto colado/);
});

test('sobre-mi: bio presente y SIN mención de cédula', () => {
  assert.ok(exists('sobre-mi/index.html'), 'falta /sobre-mi');
  const h = read('sobre-mi/index.html');
  assert.match(h, /asesor inmobiliario en Jalisco/);
  assert.doesNotMatch(h.toLowerCase(), /c[eé]dula/);
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

test('assets: favicon, og e imágenes de muestra presentes en dist', () => {
  assert.ok(exists('favicon.svg'), 'falta favicon.svg');
  assert.ok(exists('robots.txt'), 'falta robots.txt');
  assert.ok(exists('img/og-default.jpg'), 'falta og-default.jpg');
  assert.ok(exists('img/ocotlan/ocotlan-1.jpg'), 'falta ocotlan-1.jpg');
  assert.ok(exists('img/placeholder/habid.svg'), 'falta habid.svg');
});

test('sitemap generado', () => {
  assert.ok(exists('sitemap-index.xml') || exists('sitemap-0.xml'), 'falta sitemap');
});
