#!/usr/bin/env bash
#
# Envia as variaveis EXPO_PUBLIC_* do .env local para os ambientes `development`, `preview` e `production` do EAS.
# O .env e ignorado pelo git e por isso NAO sobe para o EAS Build; sem isso o APK sai sem
# Firebase, sem chave do Google Maps e apontando para a URL padrao de homologacao.
#
# Uso:
#   scripts/setup-eas-env.sh            [URL da API]   # opcional, padrao: https://api.listafacil.nataldev.com.br/v1
#
# Pre-requisitos: eas-cli (`eas login` feito) e projeto ja vinculado (`eas init`).
set -euo pipefail

API_URL="${1:-https://api.listafacil.nataldev.com.br/v1}"
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"

if [ -z "$API_URL" ]; then
  echo "Uso: $0 <EXPO_PUBLIC_API_URL de producao, ex: https://api.listafacil.nataldev.com.br/v1>" >&2
  exit 1
fi
command -v eas >/dev/null || { echo "Falta 'eas' no PATH (npm i -g eas-cli)" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Nao encontrei $ENV_FILE" >&2; exit 1; }

env_value() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }

ENVIRONMENTS="development preview production"

push() { # nome valor visibilidade
  local name="$1" value="$2" vis="$3" env
  # Um ambiente por chamada: criar em varios de uma vez falha quando a variavel ja existe em algum deles.
  for env in $ENVIRONMENTS; do
    eas env:create --environment "$env" --scope project --type string \
      --name "$name" --value "$value" --visibility "$vis" --force --non-interactive >/dev/null
  done
  echo "  ok $name ($vis)"
}

echo "Enviando variaveis para os ambientes development, preview e production ..."
push EXPO_PUBLIC_API_URL "$API_URL" plaintext
push EXPO_PUBLIC_FIREBASE_STORAGE_PATH_PREFIX "$(env_value EXPO_PUBLIC_FIREBASE_STORAGE_PATH_PREFIX)" plaintext

# Chaves de cliente (Firebase e Google Maps): entram no bundle JS e no AndroidManifest,
# mas ficam ocultas no painel do EAS.
for key in EXPO_PUBLIC_GOOGLE_MAPS_API_KEY EXPO_PUBLIC_FIREBASE_API_KEY EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN \
           EXPO_PUBLIC_FIREBASE_PROJECT_ID EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET \
           EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID EXPO_PUBLIC_FIREBASE_APP_ID; do
  val="$(env_value "$key")"
  if [ -n "$val" ]; then
    push "$key" "$val" sensitive
  else
    echo "  aviso: $key nao encontrado em .env, pulando"
  fi
done

echo
echo "Pronto. Confira com: eas env:list --environment preview"
echo "Depois: npm run build:apk"
