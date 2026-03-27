import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export function ManualSelectScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Selecionar Supermercado" onBack={() => router.back()} />

      <View className="px-5 py-3">
        <Text className="text-sm text-typography-500">
          Como deseja encontrar o supermercado?
        </Text>
      </View>

      <View className="gap-3 px-5">
        <TouchableOpacity
          onPress={() => router.push('/cart/store-list')}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-4 rounded-2xl bg-background-0 p-5">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <Ionicons name="list-outline" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-typography-900">
                Buscar na lista
              </Text>
              <Text className="mt-0.5 text-xs text-typography-500">
                Pesquise entre os supermercados cadastrados
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/cart/store-map')}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-4 rounded-2xl bg-background-0 p-5">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-info-50">
              <Ionicons name="map-outline" size={24} color={colors.info} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-typography-900">
                Selecionar no mapa
              </Text>
              <Text className="mt-0.5 text-xs text-typography-500">
                Encontre o supermercado no mapa interativo
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
