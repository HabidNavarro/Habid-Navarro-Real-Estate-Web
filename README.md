# Habid Navarro Bienes Raíces · Sitio web

Sitio estático hecho con [Astro](https://astro.build). Estilo "Oscuro Premium".
Mini-sitio de 4 vistas: Inicio, Propiedades, ficha de propiedad y Contacto.

## Desarrollo local

```bash
npm install
npm run dev      # abre http://localhost:4321
```

## Compilar y probar

```bash
npm run build    # genera dist/
npm test         # compila y valida el HTML generado (27 pruebas)
npm run preview  # sirve dist/ para revisión
```

## Cómo actualizar contenido

- **Datos de la propiedad (precio, m², ubicación, tipo, mapa):** edita
  `data/properties.json`. Los campos con valor `****` siguen pendientes (p. ej.
  la ubicación exacta). Para el mapa, pega el `<iframe>` de Google Maps en el campo
  `mapaEmbed`.
- **Fotos:** las fotos reales viven en `public/img/ocotlan/` (`ocotlan-1.jpg` …
  `ocotlan-11.jpg`); reemplázalas o agrega nuevas y actualiza la lista `images` en
  `data/properties.json`. La primera de `images` es la portada (hero, tarjeta y compartir).
  Cambia también `public/img/og-default.jpg` por una buena foto para compartir en
  redes/WhatsApp.
- **Contacto / redes:** edita `data/site.json`. Cuando tengas la URL de tu página
  de Facebook, ponla en `facebook:` y el enlace aparecerá automáticamente en el footer.
- **Agregar una propiedad nueva:** copia el objeto dentro del arreglo `propiedades`
  en `data/properties.json`, cambia `slug` y los datos. Su página se genera sola.

## Marcar una propiedad como vendida

Cambia en `data/properties.json` el par de campos `status` y `status_key`:

```json
"status": "Vendida",
"status_key": "vendida"
```

Con eso, y sin tocar nada más, la propiedad queda así en todo el sitio:

- Su tarjeta se muestra en gris y deja de tener enlaces.
- Al hacer clic aparece un aviso de que fue vendida y de que los datos se retiraron
  para proteger la privacidad del cliente.
- Su ficha se sigue generando pero lleva `noindex` y sale del sitemap, así que Google
  deja de mostrarla.

La casa que quede con `status_key: "venta"` es la que el aviso ofrece como alternativa
disponible. Debe haber solo una; la prueba `solo casa-ocotlan sigue disponible` lo vigila.

## Publicar en Cloudflare Pages (gratis)

1. Sube el repositorio a GitHub.
2. En el panel de Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**
   y elige el repositorio.
3. Configuración de build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy. Cada `git push` a la rama principal vuelve a publicar automáticamente.

## Dominio

Recomendado: **habidnavarro.com** vía **Cloudflare Registrar** (~$10 USD/año).
En Cloudflare: **Registrar → Register Domain**; y como el sitio ya vive en Pages, en
**Pages → Custom domains** agrega `habidnavarro.com` (el DNS se configura solo).

## Estructura

```
src/
  data/        content.ts (wrapper tipado)
  components/   logo, nav, footer, WhatsApp, hero, tarjetas, galería, etc.
  layouts/      BaseLayout.astro (estructura común + SEO)
  pages/        index, propiedades/, contacto, aviso-de-privacidad
  styles/       global.css (design tokens "Oscuro Premium")
data/           site.json (marca/contacto), properties.json (catálogo)
public/         favicon, robots.txt, imágenes
tests/          site.test.mjs (valida el HTML compilado)
```
