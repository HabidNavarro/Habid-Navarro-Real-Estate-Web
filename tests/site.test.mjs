import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const dist = (p) => new URL(`../dist/${p}`, import.meta.url);
export const read = (p) => readFileSync(dist(p), 'utf8');
export const exists = (p) => existsSync(dist(p));

test('el build genera dist/index.html', () => {
  assert.ok(exists('index.html'), 'no se generó dist/index.html');
});
