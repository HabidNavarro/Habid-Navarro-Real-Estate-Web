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

test('solo casa-ocotlan sigue disponible; el resto está vendida', () => {
  const disponibles = properties.filter((p) => p.status_key !== 'vendida');
  assert.deepEqual(disponibles.map((p) => p.slug), ['casa-ocotlan']);
  for (const p of properties.filter((x) => x.status_key === 'vendida')) {
    assert.equal(p.status, 'Vendida', `${p.slug}: el texto del estado debe decir "Vendida"`);
    assert.equal(p.featured, false, `${p.slug}: una vendida no puede ser la destacada`);
  }
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
