#!/usr/bin/env bash
#
# Prepara tudo que o workflow .github/workflows/android-release.yml precisa:
#   1. Gera o keystore de upload (uma vez) em ~/.listafacil-secrets/
#   2. Envia keystore, senhas, service account e variaveis EXPO_PUBLIC_* para o GitHub
#
# Uso:
#   scripts/setup-play-ci.sh            [URL da API]   # opcional, padrao: https://api.listafacil.nataldev.com.br/v1
#
# Pre-requisitos: gh (autenticado), keytool (JDK), jq, e a chave JSON da service account em
#   ~/.listafacil-secrets/play-publisher.json  (gerada com gcloud, ver docs/release-android.md)
set -euo pipefail

API_URL="${1:-https://api.listafacil.nataldev.com.br/v1}"
SEC_DIR="${LISTAFACIL_SECRETS_DIR:-$HOME/.listafacil-secrets}"
KEYSTORE="$SEC_DIR/upload-keystore.jks"
KEYSTORE_ENV="$SEC_DIR/keystore.env"
SA_JSON="$SEC_DIR/play-publisher.json"
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

if [ -z "$API_URL" ]; then
  echo "Uso: $0 <EXPO_PUBLIC_API_URL de producao, ex: https://api.listafacil.nataldev.com.br/v1>" >&2
  exit 1
fi
for bin in gh keytool jq base64; do
  command -v "$bin" >/dev/null || { echo "Falta '$bin' no PATH" >&2; exit 1; }
done
[ -f "$SA_JSON" ] || { echo "Nao encontrei $SA_JSON (gere com gcloud, ver docs/release-android.md)" >&2; exit 1; }

mkdir -p "$SEC_DIR" && chmod 700 "$SEC_DIR"

# 1. Keystore de upload --------------------------------------------------------
if [ -f "$KEYSTORE" ] && [ -f "$KEYSTORE_ENV" ]; then
  echo "Keystore ja existe em $KEYSTORE, reutilizando."
else
  PASS="$(openssl rand -base64 30 | tr -d '/+=' | cut -c1-28)"
  keytool -genkeypair -v -storetype PKCS12 \
    -keystore "$KEYSTORE" -alias upload -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$PASS" -keypass "$PASS" \
    -dname "CN=Lista Facil, O=ListaFacil, L=Sao Paulo, ST=SP, C=BR" >/dev/null
  printf 'ANDROID_KEYSTORE_PASSWORD=%s\nANDROID_KEY_ALIAS=upload\nANDROID_KEY_PASSWORD=%s\n' "$PASS" "$PASS" > "$KEYSTORE_ENV"
  chmod 600 "$KEYSTORE" "$KEYSTORE_ENV"
  echo "Keystore gerado em $KEYSTORE"
  echo "  >>> FACA BACKUP desta pasta. Sem o keystore nao da para publicar atualizacoes. <<<"
fi
# shellcheck disable=SC1090
source "$KEYSTORE_ENV"

echo "SHA-1 do certificado de upload (Play Console > Integridade do app):"
keytool -list -v -keystore "$KEYSTORE" -storepass "$ANDROID_KEYSTORE_PASSWORD" 2>/dev/null | grep -E '^\s*SHA1:' | sed 's/^/  /'

# 2. Secrets e variables no GitHub -------------------------------------------
echo "Enviando secrets para $REPO ..."
base64 < "$KEYSTORE" | tr -d '\n' | gh secret set ANDROID_KEYSTORE_BASE64 --repo "$REPO"
gh secret set ANDROID_KEYSTORE_PASSWORD --repo "$REPO" --body "$ANDROID_KEYSTORE_PASSWORD"
gh secret set ANDROID_KEY_ALIAS        --repo "$REPO" --body "$ANDROID_KEY_ALIAS"
gh secret set ANDROID_KEY_PASSWORD     --repo "$REPO" --body "$ANDROID_KEY_PASSWORD"
gh secret set PLAY_SERVICE_ACCOUNT_JSON --repo "$REPO" < "$SA_JSON"

# EXPO_PUBLIC_* do .env local (chaves de cliente: Firebase e Google Maps)
env_value() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }
for key in EXPO_PUBLIC_GOOGLE_MAPS_API_KEY EXPO_PUBLIC_FIREBASE_API_KEY EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN \
           EXPO_PUBLIC_FIREBASE_PROJECT_ID EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET \
           EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID EXPO_PUBLIC_FIREBASE_APP_ID; do
  val="$(env_value "$key")"
  if [ -n "$val" ]; then
    gh secret set "$key" --repo "$REPO" --body "$val"
  else
    echo "  aviso: $key nao encontrado em .env, pulando"
  fi
done

gh variable set EXPO_PUBLIC_API_URL --repo "$REPO" --body "$API_URL"
gh variable set EXPO_PUBLIC_FIREBASE_STORAGE_PATH_PREFIX --repo "$REPO" --body "$(env_value EXPO_PUBLIC_FIREBASE_STORAGE_PATH_PREFIX)"

SA_EMAIL="$(jq -r .client_email "$SA_JSON")"
cat <<MSG

Pronto. Falta apenas o que so o Play Console permite fazer manualmente:
  1. Play Console > Usuarios e permissoes > Convidar novos usuarios
     e-mail: $SA_EMAIL
     Permissoes do app: "Lancar em faixas de teste" (e "Gerenciar versoes" se quiser producao).
  2. Criar o app "Lista Facil" (package com.listafacil.app) no Play Console, se ainda nao existir.
  3. Fazer o PRIMEIRO envio do AAB manualmente (Teste interno) - a API do Google Play exige.
     Rode o workflow via "Actions > Run workflow" para gerar o AAB e baixe o artifact.
Depois disso, "git tag v1.0.1 && git push origin v1.0.1" publica sozinho no teste interno.
MSG
