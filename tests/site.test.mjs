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
