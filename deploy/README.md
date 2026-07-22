# Vista previa en el miniserver

El sitio corre en un contenedor del miniserver como **taller y vista previa**.
No es el sitio publico.

| | Donde vive | Quien lo actualiza |
| --- | --- | --- |
| **Publico** (habidnavarro.com) | Cloudflare Pages | `npm run build` + wrangler, desde la laptop |
| **Vista previa** (dev.habidnavarro.com) | contenedor `habid-web` del miniserver | `deploy/actualizar.sh`, desde el server |

Que el publico no dependa del miniserver es a proposito: si se va la luz o el internet
de la casa, el sitio del cliente sigue en pie.

## Trabajar desde el miniserver

```bash
ssh miniserver
cd ~/habid-web
# editas lo que sea (data/properties.json, src/, public/img/ ...)
git add -A && git commit -m "..." && git push
./deploy/actualizar.sh
```

`actualizar.sh` hace `git pull`, reconstruye el contenedor y verifica que responda 200.

## Como esta armado

- **`Dockerfile`**: dos etapas. `node:20-alpine` compila el sitio (`npm ci && npm run build`)
  y la imagen final es `caddy:2-alpine` sirviendo solo `dist/`. En ejecucion no hay Node
  ni `node_modules`.
- **`Caddyfile`**: sirve el estatico, comprime, resuelve el 404 de Astro y manda
  `X-Robots-Tag: noindex` para que la vista previa nunca compita en Google con el sitio real.
- **`compose.habid.yml`**: el contenedor en `127.0.0.1:8130` mas el tunel de Cloudflare.
  Red propia `habid_default`, aislada de los stacks de Toro y Pulso.

## Agregar un backend mas adelante

Todo esta puesto para eso y no hay que rehacer nada:

1. Agrega el servicio `habid-api` a `compose.habid.yml`, en la red `habid_default`.
2. En `Caddyfile`, antes de `file_server`, enruta la API:

   ```
   handle /api/* {
       reverse_proxy habid-api:8000
   }
   ```

3. `docker compose -f deploy/compose.habid.yml up -d --build`

El sitio sigue siendo estatico y Astro no necesita cambiar a modo servidor, asi que
Cloudflare Pages puede seguir publicando exactamente el mismo build.

Si el backend necesita base de datos, el miniserver ya tiene Postgres en
`stack-postgres` (`127.0.0.1:5432`). Conviene una base propia, como hizo Pulso con
`pulso-db`, para no acoplar este proyecto al stack de Toro.

## Publicar en produccion

Se sigue haciendo desde la laptop (ver la memoria del proyecto y el README raiz):

```bash
npm run build
npx wrangler pages deploy dist --project-name habidnavarro --branch main --commit-dirty=true
```
