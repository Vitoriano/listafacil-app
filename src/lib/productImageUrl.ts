/**
 * Integração com Firebase Storage.
 *
 * A API guarda o path tal como no bucket: só o ficheiro, path com pastas, ou `gs://bucket/...`.
 *
 * Buckets novos usam `*.firebasestorage.app` (antes `*.appspot.com`). A URL REST é sempre:
 * `https://firebasestorage.googleapis.com/v0/b/{bucketId}/o/{encodeURIComponent(objectPath)}?alt=media`
 * — o path completo do objeto vai num único segmento codificado (`produtos/arquivo.webp` → `produtos%2Farquivo.webp`).
 *
 * Preferir `getDownloadURL` (SDK) para ficheiros com regras privadas; a REST `?alt=media` funciona quando o objeto é legível sem token.
 */

function normalizeStorageObjectPath(path: string): string {
  let p = path.trim().replace(/\\/g, '/');
  p = p.replace(/^\/+/, '');
  return p;
}

/** ID do bucket para a API REST (`v0/b/...`), sem `gs://`. Aceita env `proj.firebasestorage.app` ou `proj.appspot.com`. */
export function normalizeStorageBucketId(raw: string): string {
  const s = raw.trim();
  if (s.startsWith('gs://')) {
    return s.slice('gs://'.length).split('/')[0] ?? '';
  }
  return s;
}

/** Pasta no bucket antes do nome do ficheiro (ex. `produtos/`). Vazio = ficheiro na raiz. */
export function storageFolderPrefix(): string {
  const raw = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_PATH_PREFIX;
  if (raw === undefined || raw === null) {
    return 'produtos/';
  }
  const t = raw.trim();
  if (t === '') {
    return '';
  }
  return t.replace(/\/?$/, '/');
}

/**
 * Path do objeto no Storage para passar a `ref(storage, path)`.
 * - Se a chave já tiver `/`, usa-se como path completo (ex. `produtos/ficheiro.webp`).
 * - Senão junta-se `EXPO_PUBLIC_FIREBASE_STORAGE_PATH_PREFIX` + nome do ficheiro.
 */
function pathFromKey(storageKeyOrUrl: string): string | null {
  const s = storageKeyOrUrl.trim();
  if (s === '') return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return null;

  if (s.startsWith('gs://')) {
    const rest = s.slice('gs://'.length);
    const i = rest.indexOf('/');
    if (i === -1) return null;
    return normalizeStorageObjectPath(rest.slice(i + 1));
  }

  const prefix = storageFolderPrefix();
  let raw: string;
  if (s.includes('/')) {
    raw = s;
  } else {
    raw = prefix ? `${prefix}${s}` : s;
  }
  return normalizeStorageObjectPath(raw);
}

/**
 * Paths para `getDownloadURL`: primeiro com prefixo do env (ex. `produtos/nome.ext`), depois só o nome na raiz se for chave simples.
 */
export function getCandidateStoragePaths(storageKeyOrUrl: string): string[] {
  const s = storageKeyOrUrl.trim();
  if (s === '' || s.startsWith('http://') || s.startsWith('https://')) {
    return [];
  }

  const primary = pathFromKey(s);
  if (!primary) return [];

  const paths = [primary];
  const isGsUri = s.startsWith('gs://');
  if (!isGsUri && !s.includes('/') && primary !== s) {
    paths.push(s);
  }

  return [...new Set(paths)];
}

export function getStoragePathFromKey(storageKeyOrUrl: string): string | null {
  return pathFromKey(storageKeyOrUrl);
}

/**
 * URL REST pública (`?alt=media`) para um path de objeto já normalizado.
 * @see https://firebase.google.com/docs/storage/web/download-files#download_data_via_url
 */
export function buildRestMediaUrlForObjectPath(objectPath: string): string | null {
  const bucketRaw = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!bucketRaw) return null;
  const bucketId = normalizeStorageBucketId(bucketRaw);
  if (!bucketId) return null;
  const encoded = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketId}/o/${encoded}?alt=media`;
}

/**
 * Monta a URL REST a partir da chave da API (nome do ficheiro, path ou `gs://...`).
 * URLs `http(s)` devolvidas pela API são repassadas sem alteração.
 */
export function buildProductImageUrl(
  storageKeyOrUrl: string | null | undefined,
): string | null {
  if (storageKeyOrUrl == null) return null;
  const s = storageKeyOrUrl.trim();
  if (s === '') return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;

  const objectPath = pathFromKey(s);
  if (!objectPath) return null;
  return buildRestMediaUrlForObjectPath(objectPath);
}

export function getDebugDownloadAttemptTable(storageKeyOrUrl: string): {
  objectPath: string;
  restMediaUrl: string | null;
}[] {
  return getCandidateStoragePaths(storageKeyOrUrl).map((objectPath) => ({
    objectPath,
    restMediaUrl: buildRestMediaUrlForObjectPath(objectPath),
  }));
}

export function describeProductImageResolution(
  storageKeyOrUrl: string | null | undefined,
): {
  rawKey: string | null;
  /** URL https da API ou URL REST `?alt=media` montada a partir da chave + `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`. */
  resolvedUrl: string | null;
  bucketConfigured: boolean;
  reasonIfNull: string | null;
} {
  const rawKey =
    storageKeyOrUrl == null || String(storageKeyOrUrl).trim() === ''
      ? null
      : String(storageKeyOrUrl).trim();

  if (!rawKey) {
    return {
      rawKey: null,
      resolvedUrl: null,
      bucketConfigured: Boolean(
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
      ),
      reasonIfNull: 'api_sem_image_url',
    };
  }

  if (rawKey.startsWith('http://') || rawKey.startsWith('https://')) {
    return {
      rawKey,
      resolvedUrl: rawKey,
      bucketConfigured: true,
      reasonIfNull: null,
    };
  }

  const bucketConfigured = Boolean(
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  );
  const objectPath = getStoragePathFromKey(rawKey);
  const resolvedUrl = buildProductImageUrl(rawKey);

  let reasonIfNull: string | null = null;
  if (!objectPath) {
    reasonIfNull = 'chave_storage_invalida_apos_normalizar';
  } else if (!bucketConfigured) {
    reasonIfNull = 'falta_EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET_no_env';
  } else if (!resolvedUrl) {
    reasonIfNull = 'bucket_invalido_apos_normalizar';
  }

  return {
    rawKey,
    resolvedUrl,
    bucketConfigured,
    reasonIfNull,
  };
}
