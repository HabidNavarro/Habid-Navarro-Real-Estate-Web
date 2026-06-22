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

test('home: muestra Valle Imperial, amenidades y CTA', () => {
  const h = read('index.html');
  assert.match(h, /Valle Imperial/);
  for (const a of ['Cinemex', 'Alberca', 'Salón de eventos', 'Áreas verdes']) {
    assert.ok(h.includes(a), `falta amenidad ${a}`);
  }
  assert.ok(h.includes('Ver la propiedad') || h.includes('Conoce la propiedad'), 'falta CTA a la propiedad');
});

test('propiedades: lista con tarjeta a Valle Imperial', () => {
  assert.ok(exists('propiedades/index.html'), 'falta /propiedades');
  const h = read('propiedades/index.html');
  assert.match(h, /href="\/propiedades\/valle-imperial"/);
  assert.match(h, /En venta/);
});

test('ficha: datos clave con placeholders, amenidades y descripción', () => {
  assert.ok(exists('propiedades/valle-imperial/index.html'), 'falta la ficha');
  const h = read('propiedades/valle-imperial/index.html');
  assert.ok(h.includes('****'), 'deben verse los datos pendientes ****');
  assert.match(h, /Precio/);
  assert.match(h, /Amenidades/);
  assert.match(h, /comunidad privada en Zapopan/);
});

test('sobre-mi: bio presente y SIN mención de cédula', () => {
  assert.ok(exists('sobre-mi/index.html'), 'falta /sobre-mi');
  const h = read('sobre-mi/index.html');
  assert.match(h, /asesor inmobiliario en Guadalajara y Zapopan/);
  assert.doesNotMatch(h.toLowerCase(), /c[eé]dula/);
});
