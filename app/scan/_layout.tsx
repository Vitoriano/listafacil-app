import { Stack } from 'expo-router';

/** Telas de câmera em tela cheia (leitura de código de barras). */
export default function ScanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        animationDuration: 250,
      }}
    />
  );
}
