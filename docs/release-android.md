# Release Android → Google Play (teste interno)

Pipeline automático via GitHub Actions. Para builds pelo EAS (APK de teste, dev client, submit
manual) veja [eas-build.md](eas-build.md).

Ao dar push numa tag `vX.Y.Z`, o workflow `.github/workflows/android-release.yml`:

1. Define `expo.version = X.Y.Z` e `expo.android.versionCode = GITHUB_RUN_NUMBER` no `app.json`.
2. Roda `expo prebuild --platform android` e `gradlew bundleRelease` assinando com o keystore de upload
   (injetado por `plugins/withAndroidReleaseSigning.js`).
3. Guarda o `.aab` como artifact e publica na faixa **internal** do Google Play.

`Actions > Run workflow` permite disparar manualmente e escolher a faixa.

## Setup (uma vez)

### 1. Service account do Google Play (gcloud)

Já feito para o projeto `listafacil-4edd1`; para recriar:

```bash
gcloud services enable androidpublisher.googleapis.com --project listafacil-4edd1
gcloud iam service-accounts create play-publisher \
  --display-name "GitHub Actions - Google Play publisher" --project listafacil-4edd1
gcloud iam service-accounts keys create ~/.listafacil-secrets/play-publisher.json \
  --iam-account play-publisher@listafacil-4edd1.iam.gserviceaccount.com --project listafacil-4edd1
```

### 2. Keystore + secrets no GitHub

```bash
scripts/setup-play-ci.sh   # usa https://api.listafacil.nataldev.com.br/v1 por padrão
```

Gera `~/.listafacil-secrets/upload-keystore.jks` (faça backup!) e envia para o repositório:

| Tipo     | Nome                                        | Origem                         |
|----------|---------------------------------------------|--------------------------------|
| secret   | `ANDROID_KEYSTORE_BASE64`                   | keystore em base64             |
| secret   | `ANDROID_KEYSTORE_PASSWORD` / `ANDROID_KEY_ALIAS` / `ANDROID_KEY_PASSWORD` | `keystore.env` |
| secret   | `PLAY_SERVICE_ACCOUNT_JSON`                 | `play-publisher.json`          |
| secret   | `EXPO_PUBLIC_FIREBASE_*`, `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | `.env` local  |
| variable | `EXPO_PUBLIC_API_URL`                       | argumento do script            |
| variable | `EXPO_PUBLIC_FIREBASE_STORAGE_PATH_PREFIX`  | `.env` local                   |

### 3. Play Console (manual, não há API)

1. **Usuários e permissões → Convidar**: `play-publisher@listafacil-4edd1.iam.gserviceaccount.com`
   com permissão "Lançar em faixas de teste".
2. Criar o app **Lista Fácil** com package `com.listafacil.app` (se ainda não existir).
3. **Primeiro envio manual**: a API do Play só aceita uploads depois de um primeiro AAB enviado pelo console.
   Rode o workflow manualmente, baixe o artifact `.aab` e envie em *Teste interno*.

## Publicar

```bash
git tag v1.0.1
git push origin v1.0.1
```

## Build local assinado (opcional)

```bash
npx expo prebuild --platform android
source ~/.listafacil-secrets/keystore.env
cd android && ./gradlew bundleRelease \
  -PLISTAFACIL_UPLOAD_STORE_FILE=$HOME/.listafacil-secrets/upload-keystore.jks \
  -PLISTAFACIL_UPLOAD_STORE_PASSWORD=$ANDROID_KEYSTORE_PASSWORD \
  -PLISTAFACIL_UPLOAD_KEY_ALIAS=$ANDROID_KEY_ALIAS \
  -PLISTAFACIL_UPLOAD_KEY_PASSWORD=$ANDROID_KEY_PASSWORD
```

Sem essas propriedades o `release` usa o `debug.keystore`, útil para testar o build.

## Build via EAS (APK de teste, AAB sem GitHub, dev client)

Perfis em `eas.json`, variáveis de ambiente, keystores e `eas submit` estão documentados em
[eas-build.md](eas-build.md). Resumo:

```bash
scripts/setup-eas-env.sh    # uma vez: envia EXPO_PUBLIC_* para o EAS
npm run build:apk           # APK instalável (perfil preview)
npm run build:aab           # AAB de produção (bump manual do versionCode antes)
eas submit -p android --profile production --latest
```

**Atenção**: o keystore do EAS é diferente do `upload-keystore.jks` deste workflow. Veja a seção
"Keystores" do guia para unificar.
