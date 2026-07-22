import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const properties = JSON.parse(readFileSync(new URL('./data/properties.json', import.meta.url), 'utf8'));

// Las fichas de propiedades vendidas se generan pero no se enlazan ni se indexan:
// el catálogo las bloquea con un aviso y la página lleva noindex, así que tampoco
// deben aparecer en el sitemap.
const soldPaths = properties
  .filter((p) => p.status_key === 'vendida')
  .map((p) => `/propiedades/${p.slug}`);

export default defineConfig({
  site: 'https://habidnavarro.com',
  integrations: [sitemap({ filter: (page) => !soldPaths.some((path) => page.includes(path)) })],
});
