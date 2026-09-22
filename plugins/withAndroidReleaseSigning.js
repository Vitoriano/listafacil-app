/**
 * Config plugin: assinatura de release no Android a partir de propriedades do Gradle.
 *
 * Quando `LISTAFACIL_UPLOAD_STORE_FILE` existe (CI), o build `release` usa o keystore de upload.
 * Sem a propriedade (build local), continua a usar o `debug.keystore` como o template do Expo.
 *
 * Propriedades lidas (em `~/.gradle/gradle.properties` ou `-P`):
 *   LISTAFACIL_UPLOAD_STORE_FILE, LISTAFACIL_UPLOAD_STORE_PASSWORD,
 *   LISTAFACIL_UPLOAD_KEY_ALIAS, LISTAFACIL_UPLOAD_KEY_PASSWORD
 */
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = 'LISTAFACIL_UPLOAD_STORE_FILE';

const RELEASE_SIGNING_CONFIG = `
        release {
            if (project.hasProperty('${MARKER}')) {
                storeFile file(${MARKER})
                storePassword LISTAFACIL_UPLOAD_STORE_PASSWORD
                keyAlias LISTAFACIL_UPLOAD_KEY_ALIAS
                keyPassword LISTAFACIL_UPLOAD_KEY_PASSWORD
            }
        }`;

const RELEASE_SIGNING_SELECTOR =
  `signingConfig project.hasProperty('${MARKER}') ? signingConfigs.release : signingConfigs.debug`;

function applyReleaseSigning(contents) {
  if (contents.includes(MARKER)) return contents;

  const buildTypesIndex = contents.indexOf('buildTypes {');
  if (buildTypesIndex === -1) {
    throw new Error('[withAndroidReleaseSigning] "buildTypes {" nao encontrado em app/build.gradle');
  }

  const head = contents.slice(0, buildTypesIndex);
  const tail = contents.slice(buildTypesIndex);

  const patchedTail = tail.replace(
    /(release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
    `$1${RELEASE_SIGNING_SELECTOR}`,
  );
  if (patchedTail === tail) {
    throw new Error('[withAndroidReleaseSigning] signingConfig do buildType release nao encontrado');
  }

  const patchedHead = head.replace(
    /(signingConfigs \{\s*debug \{[^}]*\})/,
    `$1${RELEASE_SIGNING_CONFIG}`,
  );
  if (patchedHead === head) {
    throw new Error('[withAndroidReleaseSigning] bloco signingConfigs.debug nao encontrado');
  }

  return patchedHead + patchedTail;
}

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error('[withAndroidReleaseSigning] suporta apenas build.gradle em Groovy');
    }
    cfg.modResults.contents = applyReleaseSigning(cfg.modResults.contents);
    return cfg;
  });
};

module.exports.applyReleaseSigning = applyReleaseSigning;
