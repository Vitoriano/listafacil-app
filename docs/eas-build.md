# Build Android com EAS (Expo Application Services)

Guia do fluxo de build nativo via EAS: gerar um **APK instalável** para testadores, um **AAB** para o
Google Play e um **dev client**. Complementa [release-android.md](release-android.md), que cobre o
pipeline automático do GitHub Actions (tag `vX.Y.Z` → Play).

## Quando usar cada caminho

| Objetivo                                             | Caminho                                   |
|------------------------------------------------------|-------------------------------------------|
| Mandar um APK para alguém testar sem Play            | `npm run build:apk` (EAS, perfil preview) |
| Publicar versão na faixa internal do Play            | `git tag vX.Y.Z && git push --tags` (GitHub Actions) |
| Publicar no Play sem depender do GitHub              | `npm run build:aab` + `eas submit`        |
| Rodar o app com módulos nativos sem Expo Go          | `npm run build:dev` (dev client)          |

## Arquivos envolvidos

| Arquivo                                   | Papel                                                                 |
|-------------------------------------------|-----------------------------------------------------------------------|
| `eas.json`                                | Perfis de build (`development`, `preview`, `production`) e de submit  |
| `app.json`                                | Config estática: `version`, `android.versionCode`, `package`, plugins, `extra.eas.projectId`, `owner` |
| `app.config.js`                           | Config dinâmica: injeta a chave do Google Maps a partir do env        |
| `plugins/withAndroidReleaseSigning.js`    | Config plugin: assinatura de release via propriedades do Gradle       |
| `scripts/setup-eas-env.sh`                | Envia as `EXPO_PUBLIC_*` do `.env` para os ambientes do EAS           |
| `package.json` (`build:*`)                | Atalhos para os comandos `eas build`                                  |
| `.env` / `.env.example`                   | Variáveis locais (ignorado pelo git; **não sobe** para o EAS)         |

## Perfis (`eas.json`)

Todos estendem `base`, que fixa `node: 24.8.0` (mesma versão usada localmente e no GitHub Actions).

| Perfil        | Saída | `distribution` | Detalhes                                              | Uso                                   |
|---------------|-------|----------------|-------------------------------------------------------|---------------------------------------|
| `development` | APK   | internal       | `developmentClient: true`, `:app:assembleDebug`       | `expo start --dev-client`             |
| `preview`     | APK   | internal       | build release, assinado com o keystore do EAS         | testar direto no aparelho             |
| `production`  | AAB   | store          | `autoIncrement: false`                                | Google Play (`eas submit`)            |

O bloco `submit.production` envia para a faixa **internal** com `releaseStatus: completed`.

`cli.appVersionSource` é `local`: a versão vem do `app.json`, não do servidor do EAS. O EAS
não incrementa nada sozinho.

### Ambiente de variáveis por perfil

Os perfis não declaram `environment`, então o EAS usa o padrão:

- `development` → ambiente `development`
- `preview` (`distribution: internal`) → ambiente `preview`
- `production` → ambiente `production`

O script `scripts/setup-eas-env.sh` popula apenas `preview` e `production`. O dev client não precisa:
ele carrega o JS pelo Metro, que lê o `.env` da sua máquina em tempo de execução.

## Setup (uma vez por máquina)

```bash
npm i -g eas-cli            # eas.json exige >= 18; ou use npx eas-cli
eas login                   # conta Expo (owner: vitorianoernandes)
eas init                    # só se extra.eas.projectId não existir no app.json
scripts/setup-eas-env.sh    # envia EXPO_PUBLIC_* para o EAS (preview + production)
```

O projeto já está vinculado (`extra.eas.projectId` no `app.json`), então `eas init` normalmente
não é necessário.

### Por que rodar `setup-eas-env.sh`

O `.env` é ignorado pelo git e o EAS Build faz checkout limpo do repositório. Sem as variáveis no
EAS, o build sai com:

- API apontando para `http://localhost:3000/v1` (fallback em `src/config/constants.ts`)
- Firebase sem configuração
- Mapa em branco (sem chave do Google Maps)

O script lê o `.env` local e cria cada variável nos ambientes `preview` e `production`:

| Variável                                   | Visibilidade | Origem                          |
|--------------------------------------------|--------------|---------------------------------|
| `EXPO_PUBLIC_API_URL`                      | plaintext    | argumento do script (padrão `https://api.listafacil.nataldev.com.br/v1`) |
| `EXPO_PUBLIC_FIREBASE_STORAGE_PATH_PREFIX` | plaintext    | `.env`                          |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`          | sensitive    | `.env`                          |
| `EXPO_PUBLIC_FIREBASE_*` (6 chaves)        | sensitive    | `.env`                          |

`sensitive` só oculta o valor no painel do EAS. Todas as `EXPO_PUBLIC_*` acabam embutidas no bundle
JS, então nunca coloque segredo de servidor nelas.

Para outra URL de API:

```bash
scripts/setup-eas-env.sh https://staging.exemplo.com/v1
```

Conferir e ajustar depois:

```bash
eas env:list --environment preview
eas env:update --environment preview --name EXPO_PUBLIC_API_URL --value https://...
eas env:pull --environment preview     # gera .env.local com os valores do EAS
```

### Chave do Google Maps no AndroidManifest

`react-native-maps` com `PROVIDER_GOOGLE` exige a chave no `AndroidManifest`, não basta no JS.
`app.config.js` lê `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` e grava em `android.config.googleMaps.apiKey`
durante o prebuild. Sem a variável a chave simplesmente não é injetada e o mapa fica em branco.

## Gerar um APK de teste

```bash
npm run build:apk           # eas build --platform android --profile preview
```

Ao terminar, o terminal mostra o link e o QR code para baixar o `.apk`. Também dá para acompanhar em
`eas build:list` ou no painel do Expo.

Na **primeira vez** o EAS pergunta se pode gerar um keystore para o projeto. Responda sim. Esse
keystore fica guardado no EAS (`eas credentials`) e assina todos os builds `preview` e `production`.

### Build local (sem fila)

```bash
npm run build:apk:local     # eas build ... --local
```

Requisitos: JDK 17 e Android SDK instalados. O build roda na sua máquina, mas segue o mesmo perfil
e usa as credenciais do EAS. Garanta que o `.env` local tenha `EXPO_PUBLIC_API_URL` de produção
ou rode `eas env:pull --environment preview` antes, senão o APK aponta para localhost.

## Gerar AAB e enviar ao Google Play

```bash
# 1. bump manual do versionCode (ver seção Versionamento)
npm run build:aab                                       # perfil production
eas submit -p android --profile production --latest     # faixa internal
```

Na primeira vez o `eas submit` pede a chave JSON da service account do Play. Informe
`~/.listafacil-secrets/play-publisher.json` (gerada com gcloud, ver
[release-android.md](release-android.md#1-service-account-do-google-play-gcloud)) e aceite guardá-la
no EAS. As próximas vezes não perguntam mais.

Pré-requisitos no Play Console, iguais ao pipeline do GitHub: app criado com package
`com.listafacil.app`, service account convidada com permissão de lançar em faixas de teste, e um
primeiro AAB enviado manualmente pelo console (a API do Play só aceita uploads depois disso).

## Versionamento

`appVersionSource: local` + `autoIncrement: false` significa que **ninguém incrementa o
`versionCode` por você** no EAS. Antes de cada build `production`:

1. Edite `expo.version` (ex.: `1.0.1`) e `expo.android.versionCode` em `app.json`.
2. O Play rejeita `versionCode` igual ou menor que um já enviado.

**Atenção ao misturar com o GitHub Actions**: o workflow usa `GITHUB_RUN_NUMBER` como
`versionCode` (pode ser 12, 13, 14...). Se você já publicou pelo GitHub e agora vai enviar pelo EAS,
use um `versionCode` maior que o último publicado, senão o Play recusa o AAB.

## Keystores: EAS vs GitHub Actions

Existem **dois keystores diferentes** no projeto:

| Onde              | Keystore                                      | Assina                          |
|-------------------|-----------------------------------------------|---------------------------------|
| EAS               | gerado pelo EAS na primeira build              | `preview` e `production` do EAS |
| GitHub Actions    | `~/.listafacil-secrets/upload-keystore.jks`    | AAB do workflow                 |

Consequências:

- Um APK do EAS **não instala por cima** de um build do GitHub (e vice-versa). É preciso desinstalar
  antes.
- O Play aceita os dois como upload key só se ambos estiverem registrados no Play App Signing. Na
  prática, use um único keystore.

Para unificar, suba o keystore do GitHub para o EAS:

```bash
eas credentials -p android
# Android → Keystore → Set up a new keystore → upload existing
# arquivo: ~/.listafacil-secrets/upload-keystore.jks
# senhas e alias: ~/.listafacil-secrets/keystore.env
```

O plugin `withAndroidReleaseSigning` não interfere no EAS: ele só troca a assinatura quando a
propriedade `LISTAFACIL_UPLOAD_STORE_FILE` existe no Gradle, o que acontece apenas no workflow do
GitHub. No EAS o próprio serviço injeta as credenciais.

## Dev client

```bash
npm run build:dev           # APK debug com expo-dev-client
# instalar no aparelho, depois:
npx expo start --dev-client
```

Necessário quando o app usa módulo nativo que o Expo Go não traz. Refaça o build só quando mudar
dependência nativa ou config em `app.json`; alterações em JS chegam pelo Metro.

## Comandos úteis

```bash
eas build:list                       # histórico de builds
eas build:view <id>                  # detalhes e logs
eas build:cancel                     # cancela build em andamento
eas credentials -p android           # keystore, service account
eas env:list --environment preview   # variáveis do ambiente
eas whoami                           # conta logada
```

## Problemas comuns

| Sintoma                                               | Causa provável                                   | Solução                                             |
|-------------------------------------------------------|--------------------------------------------------|-----------------------------------------------------|
| App chama `localhost:3000`                            | `EXPO_PUBLIC_API_URL` não está no EAS             | `scripts/setup-eas-env.sh` e refaça o build          |
| Mapa em branco                                        | chave do Maps ausente no manifest                | idem; confira `eas env:list`                         |
| Login/Firebase falha                                  | `EXPO_PUBLIC_FIREBASE_*` ausentes                | idem                                                 |
| "App not installed" ao atualizar                      | keystore diferente do build anterior             | desinstale, ou unifique os keystores                 |
| Play recusa: version code já usado                    | `versionCode` não foi incrementado               | bump em `app.json`                                   |
| `eas build --local` falha no Gradle                   | JDK/SDK ausente ou versão errada                 | JDK 17 + Android SDK; ou use build na nuvem          |
| Build usa versão antiga do Node                       | `base.node` desatualizado em `eas.json`          | alinhe com `.nvmrc`/GitHub Actions                   |
| Variáveis mudaram mas o build não refletiu            | variável criada em ambiente errado               | confira `--environment` (preview vs production)      |

## Checklist de release pelo EAS

1. `.env` local completo e `scripts/setup-eas-env.sh` já executado.
2. `expo.version` e `android.versionCode` atualizados em `app.json`.
3. `npm run build:aab` finalizado sem erro.
4. `eas submit -p android --profile production --latest`.
5. Conferir no Play Console → Teste interno.
