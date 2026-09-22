const { applyReleaseSigning } = require('../../plugins/withAndroidReleaseSigning');

const TEMPLATE = `android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            signingConfig signingConfigs.debug
            minifyEnabled enableMinifyInReleaseBuilds
        }
    }
}`;

describe('withAndroidReleaseSigning', () => {
  it('injeta signingConfigs.release condicionado a LISTAFACIL_UPLOAD_STORE_FILE', () => {
    const out = applyReleaseSigning(TEMPLATE);

    expect(out).toContain("if (project.hasProperty('LISTAFACIL_UPLOAD_STORE_FILE'))");
    expect(out).toContain('storeFile file(LISTAFACIL_UPLOAD_STORE_FILE)');
    expect(out).toContain(
      "signingConfig project.hasProperty('LISTAFACIL_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug",
    );
  });

  it('mantem o buildType debug assinado com o debug.keystore', () => {
    const out = applyReleaseSigning(TEMPLATE);
    const buildTypes = out.slice(out.indexOf('buildTypes {'));
    const debugBlock = buildTypes.slice(0, buildTypes.indexOf('release {'));

    expect(debugBlock).toContain('signingConfig signingConfigs.debug');
    expect(debugBlock).not.toContain('signingConfigs.release');
  });

  it('e idempotente', () => {
    const once = applyReleaseSigning(TEMPLATE);
    expect(applyReleaseSigning(once)).toBe(once);
  });

  it('falha de forma clara se o template mudar', () => {
    expect(() => applyReleaseSigning('android {}')).toThrow(/buildTypes/);
  });
});
