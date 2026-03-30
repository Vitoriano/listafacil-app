import { buildProductImageUrl, getCandidateStoragePaths } from '@/lib/productImageUrl';
import { getFirebaseApp } from '@/config/firebase';

/**
 * Chame uma vez no boot do app (__DEV__). Usa `console.warn` para aparecer no Metro e no Flipper.
 */
export function logImagePipelineStartup(): void {
  if (!__DEV__) return;

  const bucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const hasBucket = Boolean(bucket?.trim());
  const hasApiKey = Boolean(process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim());

  console.warn(
    `[ListaFácil][Imagens] EXPO_PUBLIC no bundle: bucket=${hasBucket ? 'sim' : 'NAO (reinicie: npx expo start -c)'} | apiKey=${hasApiKey ? 'sim' : 'nao'}`,
  );

  const app = getFirebaseApp();
  console.warn(
    `[ListaFácil][Imagens] Firebase App inicializado:`,
    app ? 'sim' : 'nao (env incompleto)',
  );

  if (hasBucket) {
    const paths = getCandidateStoragePaths('exemplo-chave.webp');
    const rest = buildProductImageUrl('exemplo-chave.webp');
    console.warn(
      `[ListaFácil][Imagens] Exemplo paths (SDK) + URL REST (?alt=media):`,
      { paths, rest },
    );
  }

  console.warn(
    '[ListaFácil][Imagens] Bucket deve ser o ID atual (ex. proj.firebasestorage.app). Regras privadas: use getDownloadURL.',
  );
}
