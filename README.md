# Habid Navarro Bienes Raíces — Sitio web

Sitio estático hecho con [Astro](https://astro.build). Estilo "Oscuro Premium".
Mini-sitio de 5 vistas: Inicio, Propiedades, ficha de propiedad, Sobre mí y Contacto.

## Desarrollo local

```bash
npm install
npm run dev      # abre http://localhost:4321
```

## Compilar y probar

```bash
npm run build    # genera dist/
npm test         # compila y valida el HTML generado (13 pruebas)
npm run preview  # sirve dist/ para revisión
```

## Cómo actualizar contenido

- **Datos de la propiedad (precio, m², ubicación, tipo, mapa):** edita
  `src/data/propiedades.ts` y reemplaza los valores `****` por los reales. Para el
  mapa, pega el `<iframe>` de Google Maps en el campo `mapaEmbed`.
- **Fotos:** reemplaza los archivos en `public/img/placeholder/` por fotos reales
  (mismos nombres) o agrega nuevas y actualiza `galeria` en `propiedades.ts`.
  Cambia también `public/img/og-default.jpg` (1200×630) por una buena foto para
  compartir en redes/WhatsApp.
- **Foto de Habid:** reemplaza `public/img/placeholder/habid.svg` por una foto real
  (por ejemplo `habid.jpg`) y actualiza la ruta en `src/pages/sobre-mi.astro`.
- **Contacto / redes:** edita `src/data/site.ts`. Cuando tengas la URL de tu página
  de Facebook, ponla en `facebook:` y el enlace aparecerá automáticamente en el footer.
- **Agregar una propiedad nueva:** copia el objeto dentro del arreglo `propiedades`
  en `src/data/propiedades.ts`, cambia `slug` y los datos. Su página se genera sola.

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
  data/        site.ts (marca/contacto), propiedades.ts (catálogo)
  components/   logo, nav, footer, WhatsApp, hero, tarjetas, galería, etc.
  layouts/      BaseLayout.astro (estructura común + SEO)
  pages/        index, propiedades/, sobre-mi, contacto, aviso-de-privacidad
  styles/       global.css (design tokens "Oscuro Premium")
public/         favicon, robots.txt, imágenes
tests/          site.test.mjs (valida el HTML compilado)
```
