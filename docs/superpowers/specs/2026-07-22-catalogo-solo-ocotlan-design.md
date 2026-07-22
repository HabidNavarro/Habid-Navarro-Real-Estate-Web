# Catálogo con una sola propiedad disponible

Fecha: 2026-07-22

## Objetivo

Dejar la casa en Ocotlán como la única propiedad disponible del sitio. Las demás pasan
a estado vendida, se muestran atenuadas en gris y dejan de ser accesibles: al hacer clic
en una de ellas aparece un aviso de que la propiedad se vendió y que sus datos se
retiraron para proteger la privacidad del cliente. Además, la sección "Sobre mí"
desaparece del sitio.

## Alcance

### 1. Datos (`data/properties.json`)

Todas las propiedades salvo `casa-ocotlan` quedan con `status: "Vendida"` y
`status_key: "vendida"`.

| Propiedad | Antes | Después |
| --- | --- | --- |
| casa-ocotlan | En venta | sin cambio |
| casa-zapopan | Apartada | Vendida |
| casa-providencia | Vendida | sin cambio |
| casa-chapala | Apartada | Vendida |
| casa-tlaquepaque | Vendida | sin cambio |
| casa-tlajomulco | Apartada | Vendida |

Los textos de `summary` y `description` que hoy dicen "conserva el estado de apartada"
o "la disponibilidad debe confirmarse directamente" se reescriben: contradicen el nuevo
aviso de venta cerrada.

El valor `apartada` se conserva en el tipo `status_key` y en el modelo de datos por si
vuelve a usarse, pero deja de aparecer en el catálogo.

### 2. Tarjeta de propiedad vendida (`src/components/PropertyCard.astro`)

Cuando `status_key === 'vendida'`:

- La foto se muestra en escala de grises, con opacidad reducida y un velo oscuro encima.
- La tarjeta **no contiene ningún enlace**. Ni la foto, ni el título, ni la flecha.
- En su lugar se coloca un único botón que cubre toda la tarjeta, con
  `aria-label="<nombre>: vendida, ver aviso"` y `data-property="<nombre>"`. Un solo
  elemento interactivo evita enlaces anidados y funciona con mouse, teclado y lector
  de pantalla.
- La flecha de la esquina se reemplaza por un candado con la palabra "Vendida".
- El badge de estado existente (`EstadoBadge`) se conserva.

Sin JavaScript el botón no hace nada, pero el badge "Vendida" ya comunica el estado y
la tarjeta no lleva a ninguna parte, que es el comportamiento deseado.

Esto aplica en los tres lugares donde se renderizan tarjetas: catálogo, inicio y el
bloque "Explora otras fichas" de la ficha de Ocotlán.

### 3. Aviso emergente

Markup oculto en `src/layouts/BaseLayout.astro`, comportamiento en `public/js/app.js`,
estilos en `src/styles/global.css`. Reutiliza el patrón del lightbox ya existente.

Contenido:

> **Propiedad vendida**
> <nombre> ya fue vendida. Sus datos y fotografías se retiraron para proteger la
> privacidad del cliente.
> [Ver la propiedad disponible] [Cerrar]

El nombre se inyecta desde el `data-property` de la tarjeta pulsada. El aviso se cierra
con la X, con Escape o haciendo clic en el fondo, y el foco regresa a la tarjeta de
origen.

### 4. Fichas vendidas fuera de los buscadores

Las páginas `/propiedades/<slug>` de las propiedades vendidas se siguen generando, pero:

- `src/components/SEO.astro` acepta una prop `noindex`; cuando es verdadera emite
  `<meta name="robots" content="noindex,nofollow">` y omite el canonical.
- `src/layouts/BaseLayout.astro` propaga la prop.
- `src/pages/propiedades/[slug].astro` la activa para las vendidas.
- `astro.config.mjs` excluye esas rutas del sitemap.

Sin esto, una ficha completa podría encontrarse en Google pese a que el aviso afirma que
la información fue retirada.

### 5. Catálogo (`src/pages/propiedades/index.astro`)

- Se elimina la opción "Apartadas" del filtro de estado, porque ya no existe ninguna.
- La nota informativa se reescribe:

  > **Una propiedad disponible.** La casa en Ocotlán es la única publicada. Las demás ya
  > fueron vendidas y su información se retiró para proteger la privacidad de cada cliente.

### 6. Sobre mí

- Se elimina `src/pages/sobre-mi.astro`. La URL deja de existir y sale del sitemap.
- Se limpia el comentario obsoleto en `src/data/content.ts` y el filtro de `/sobre-mi`
  en `astro.config.mjs`.
- Se actualiza el README, que hoy habla de 5 vistas y explica cómo colocar la foto de
  Habid.

## Fuera de alcance

- Las tarjetas grises conservan precio, ubicación y resumen. Solo se bloquea la ficha.
- El inicio sigue mostrando tres tarjetas: Ocotlán a color y dos vendidas en gris.

## Pruebas

Pruebas existentes que cambian de intención:

- `sobre-mi: bio presente...` se invierte: `/sobre-mi` no debe existir.
- `propiedades: catálogo...` deja de exigir el enlace a `casa-zapopan` y el estado
  "Apartada".
- `assets: ...` deja de exigir `profile-placeholder.svg` si el archivo se elimina.

Cobertura nueva:

- Ninguna propiedad vendida se enlaza desde el catálogo ni desde el inicio.
- El markup del aviso emergente está presente en las páginas con tarjetas.
- Las fichas vendidas llevan `noindex`; la de Ocotlán no.
- En `data.test.mjs`: exactamente una propiedad con `status_key: "venta"` y es
  `casa-ocotlan`; el resto son `vendida`.
