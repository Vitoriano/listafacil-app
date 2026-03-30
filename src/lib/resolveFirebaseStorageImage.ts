import { ref, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from '@/config/firebase';
import {
  buildProductImageUrl,
  getCandidateStoragePaths,
  getDebugDownloadAttemptTable,
} from '@/lib/productImageUrl';

/** Cache em memória: storageKey → URL resolvida */
const resolvedUrlCache = new Map<string, string | null>();
/** Promises em voo para deduplicar chamadas concorrentes com a mesma chave */
const inflightRequests = new Map<string, Promise<string | null>>();

function isStorageObjectNotFound(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'storage/object-not-found'
  );
}

/**
 * Obtém a URL de download com token usando o SDK (`ref` + `getDownloadURL`).
 * `storageKeyOrUrl` é o valor da API: nome do ficheiro (ex. `9be7ec53-....webp`) ou path completo no bucket.
 */
export async function resolveProductImageDownloadUrl(
  storageKeyOrUrl: string | null | undefined,
): Promise<string | null> {
  if (storageKeyOrUrl == null) return null;
  const s = String(storageKeyOrUrl).trim();
  if (s === '') return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;

  // Retorna do cache se já foi resolvido anteriormente
  if (resolvedUrlCache.has(s)) {
    return resolvedUrlCache.get(s)!;
  }

  // Deduplica chamadas concorrentes com a mesma chave
  if (inflightRequests.has(s)) {
    return inflightRequests.get(s)!;
  }

  const promise = resolveAndCache(s, storageKeyOrUrl);
  inflightRequests.set(s, promise);

  try {
    return await promise;
  } finally {
    inflightRequests.delete(s);
  }
}

async function resolveAndCache(
  s: string,
  storageKeyOrUrl: string,
): Promise<string | null> {
  const candidates = getCandidateStoragePaths(s);
  if (candidates.length === 0) {
    resolvedUrlCache.set(s, null);
    return null;
  }

  const storage = getFirebaseStorage();
  if (!storage) {
    const url = buildProductImageUrl(storageKeyOrUrl);
    resolvedUrlCache.set(s, url);
    return url;
  }

  let lastError: unknown;
  for (const objectPath of candidates) {
    try {
      const url = await getDownloadURL(ref(storage, objectPath));
      resolvedUrlCache.set(s, url);
      return url;
    } catch (e) {
      lastError = e;
      if (isStorageObjectNotFound(e)) {
        continue;
      }
      console.warn(
        '[ListaFácil][Imagens] getDownloadURL erro (nao e object-not-found). Path:',
        objectPath,
        e,
      );
      break;
    }
  }

  logFailedSdkAttempts(s, lastError);
  const fallback = buildProductImageUrl(storageKeyOrUrl);
  resolvedUrlCache.set(s, fallback);
  return fallback;
}

function logFailedSdkAttempts(storageKey: string, lastError: unknown): void {
  const rows = getDebugDownloadAttemptTable(storageKey);
  console.warn(
    '[ListaFácil][Imagens] getDownloadURL nao encontrou objeto. Chave da API:',
    storageKey,
  );
  rows.forEach((row, i) => {
    console.warn(`[ListaFácil][Imagens]   ${i + 1}. path: ${row.objectPath}`);
    console.warn(
      '[ListaFácil][Imagens]      URL REST (fallback):',
      row.restMediaUrl ?? '(sem bucket)',
    );
  });
  console.warn('[ListaFácil][Imagens] Ultimo erro do SDK:', lastError);
}
