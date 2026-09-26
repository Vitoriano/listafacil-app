import { Stack } from 'expo-router';

// Garante que a tela do carrinho fique sempre na base da pilha desta aba,
// mesmo quando a navegação entra direto em uma tela interna (ex.: escolher loja).
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function CartLayout() {
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
