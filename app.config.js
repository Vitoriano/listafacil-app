/**
 * Config dinâmica: parte do app.json e injeta o que depende de variáveis de ambiente.
 *
 * - `android.config.googleMaps.apiKey`: react-native-maps com PROVIDER_GOOGLE exige a chave no
 *   AndroidManifest; sem ela o mapa fica em branco em builds nativos (APK/AAB).
 *   A chave vem de EXPO_PUBLIC_GOOGLE_MAPS_API_KEY (.env local ou variáveis de ambiente do EAS).
 */
module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  return {
    ...config,
    android: {
      ...config.android,
      ...(googleMapsApiKey
        ? { config: { ...config.android?.config, googleMaps: { apiKey: googleMapsApiKey } } }
        : {}),
    },
  };
};
