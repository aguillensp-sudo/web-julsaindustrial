#!/usr/bin/env bash
# Despliegue de julsaindustrial.com en el VPS (nginx + Next.js).
#
# El sitio NO está en Vercel: lo sirve un servidor propio, así que un push a
# GitHub no actualiza nada por sí solo. Este script hace el ciclo completo
# desde el directorio del proyecto en el servidor.
#
#   bash scripts/deploy-vps.sh
#
# Requisitos en el servidor: git, node y npm, y el proceso de Next.js
# gestionado por pm2 o por systemd (se detecta solo).
set -euo pipefail

BRANCH="${BRANCH:-main}"
APP_NAME="${APP_NAME:-web-julsaindustrial}"

cd "$(dirname "$0")/.."
echo "→ Directorio: $(pwd)"

echo "→ Trayendo $BRANCH…"
git fetch --prune origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "→ Instalando dependencias (npm ci)…"
npm ci

echo "→ Comprobando que el .env de producción tiene lo imprescindible…"
for var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  if ! grep -q "^$var=" .env.production .env.local .env 2>/dev/null; then
    echo "   AVISO: no encuentro $var en los .env del servidor."
  fi
done

echo "→ Build de producción…"
npm run build

echo "→ Reiniciando la aplicación…"
if command -v pm2 >/dev/null 2>&1 && pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
  pm2 save
elif systemctl list-units --type=service --all 2>/dev/null | grep -q "$APP_NAME"; then
  sudo systemctl restart "$APP_NAME"
else
  echo "   No encuentro ni el proceso pm2 '$APP_NAME' ni un servicio systemd con ese"
  echo "   nombre. Reinicia el proceso a mano, o relanza con:"
  echo "     APP_NAME=<nombre-real> bash scripts/deploy-vps.sh"
  exit 1
fi

echo "→ Comprobando el resultado…"
sleep 3
if curl -fsS http://localhost:3000/portal/registro | grep -q "consultar nuestros productos"; then
  echo "✓ La aplicación sirve ya la versión nueva."
else
  echo "✗ La aplicación responde, pero con contenido antiguo: revisa que nginx"
  echo "  apunte a este proceso y que el build haya terminado sin errores."
  exit 1
fi
