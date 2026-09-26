import { Stack } from 'expo-router';

/**
 * Histórico e detalhe de compras ficam fora das abas: são telas de leitura
 * alcançadas de vários lugares (Início, Perfil, Carrinho) e "voltar" sempre
 * retorna para onde o usuário estava.
 */
export default function PurchasesLayout() {
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
