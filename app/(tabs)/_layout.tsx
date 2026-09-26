import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useCartStore } from '@/features/cart/stores/cartStore';

export default function TabsLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const cartActive = useCartStore((s) => s.isActive);
  const cartItemCount = useCartStore((s) => s.itemCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          // Edge-to-edge is mandatory since SDK 55: size the bar from the real bottom inset
          // instead of hardcoding per-platform heights.
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 4,
          elevation: 0,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Listas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      {/* Aba central: o "modo compra" é a ação principal do app e precisa de acesso
          permanente na zona do polegar. O badge mostra a compra em andamento. */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Comprar',
          tabBarBadge: cartActive ? (cartItemCount > 0 ? cartItemCount : '') : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.success,
            color: colors.white,
            fontSize: 10,
            fontWeight: '700',
            minWidth: cartItemCount > 0 ? 18 : 10,
            height: cartItemCount > 0 ? 18 : 10,
            lineHeight: cartItemCount > 0 ? 18 : 10,
            borderRadius: 9,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
