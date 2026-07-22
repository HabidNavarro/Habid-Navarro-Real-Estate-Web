#!/usr/bin/env bash
# Actualiza la vista previa del sitio en el miniserver.
#
# Baja los cambios de GitHub, reconstruye el contenedor y verifica que responda.
# Uso:  ~/habid-web/deploy/actualizar.sh
#
# Esto NO publica en habidnavarro.com. La produccion vive en Cloudflare Pages y se
# publica aparte (ver deploy/README.md).

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Bajando cambios de GitHub"
git pull --ff-only

echo "==> Reconstruyendo el contenedor"
docker compose -f deploy/compose.habid.yml up -d --build habid-web

echo "==> Verificando que responda"
codigo=""
for _ in $(seq 1 20); do
  codigo="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8130/ || true)"
  [ "$codigo" = "200" ] && break
  sleep 2
done

if [ "$codigo" = "200" ]; then
  echo "OK: la vista previa responde en http://127.0.0.1:8130/"
else
  echo "ERROR: no respondio 200 (ultimo codigo: ${codigo:-sin respuesta})" >&2
  echo "Revisa con: docker logs habid-web --tail 50" >&2
  exit 1
fi
