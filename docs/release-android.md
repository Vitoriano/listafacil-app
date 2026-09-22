# Release Android → Google Play (teste interno)

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

## APK de teste via EAS Build

Alternativa ao workflow do GitHub para gerar um **APK instalável** (compartilhar com testadores sem Play).
A configuração está em `eas.json`:

| Perfil        | Saída | Uso                                                   |
|---------------|-------|-------------------------------------------------------|
| `development` | APK   | dev client (`expo start --dev-client`)                 |
| `preview`     | APK   | testes internos, instala direto no aparelho           |
| `production`  | AAB   | Google Play (`eas submit`, faixa internal)            |

`appVersionSource` é `local`: a versão e o `versionCode` vêm do `app.json`, como no workflow do GitHub.
Bump manual do `versionCode` antes de cada build de produção.

### Setup (uma vez)

```bash
npm i -g eas-cli            # ou npx eas-cli
eas login
eas init                    # vincula o projeto (grava extra.eas.projectId no app.json)
scripts/setup-eas-env.sh   # usa https://api.listafacil.nataldev.com.br/v1 por padrão
```

O `.env` é ignorado pelo git e **não sobe para o EAS**; o script acima envia as `EXPO_PUBLIC_*`
como variáveis de ambiente do projeto (ambientes `preview` e `production`). Sem isso o APK aponta
para `http://localhost:3000/v1` e o mapa fica em branco.

`app.config.js` injeta `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` em `android.config.googleMaps.apiKey`
(react-native-maps com provider Google exige a chave no `AndroidManifest`).

### Gerar o APK

```bash
npm run build:apk           # na nuvem; ao terminar mostra o link/QR para baixar o .apk
npm run build:apk:local     # na sua máquina (precisa de JDK 17 + Android SDK), sem fila
```

Na primeira vez o EAS pergunta se pode gerar o keystore; responda sim para builds de teste.
**Atenção**: esse keystore é diferente do `upload-keystore.jks` do workflow do GitHub. Um APK do EAS
não instala por cima de um build do GitHub (e vice-versa) sem desinstalar antes. Para usar o mesmo
keystore nos dois, envie o do `~/.listafacil-secrets/` com `eas credentials` (Android → Keystore →
Set up a new keystore → upload).

```bash
npm run build:aab           # AAB de produção
eas submit -p android --profile production --latest   # envia para a faixa internal do Play
```

Na primeira vez o `eas submit` pergunta pela chave da service account: informe
`~/.listafacil-secrets/play-publisher.json` e aceite guardá-la no EAS (fica em `eas credentials`),
assim as próximas vezes não perguntam mais.
