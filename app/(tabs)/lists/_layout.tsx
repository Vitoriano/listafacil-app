import { Stack } from 'expo-router';

// Âncora da aba: telas internas abertas por link direto sempre têm a lista/índice abaixo.
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ListsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    />
  );
}
