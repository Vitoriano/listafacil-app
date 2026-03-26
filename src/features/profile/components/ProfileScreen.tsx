import React from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { logger } from '@/shared/utils/logger';
import { useProfile } from '../hooks/useProfile';

export function ProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading } = useProfile();

  function handleViewSavings() {
    logger.info('Profile', 'Navigating to savings');
    router.push('/(tabs)/profile/savings');
  }

  function handleSettings() {
    logger.info('Profile', 'Navigating to settings');
    router.push('/(tabs)/profile/settings');
  }

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
      {/* Header / Profile card */}
      <View className="bg-background-0 border-b border-outline-100 px-4 pb-6 pt-4">
        <View className="items-center gap-3">
          {/* Avatar */}
          <View
            className="h-20 w-20 items-center justify-center rounded-full bg-primary-500"
            accessibilityRole="image"
            accessibilityLabel="Avatar do usuario"
          >
            <Text className="text-3xl font-bold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>

          <View className="items-center gap-0.5">
            <Text className="text-xl font-bold text-typography-900">
              {user?.name ?? '--'}
            </Text>
            <Text className="text-sm text-typography-500">
              {user?.email ?? '--'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="mx-4 mt-4 rounded-2xl bg-background-0 p-4">
        <Text className="mb-3 text-sm font-bold text-typography-900">
          Estatisticas
        </Text>
        <View className="flex-row">
          <View className="flex-1 items-center gap-1">
            <Text
              className="text-2xl font-bold text-primary-500"
              accessibilityLabel={`Total de envios: ${user?.totalSubmissions ?? 0}`}
            >
              {user?.totalSubmissions ?? 0}
            </Text>
            <Text className="text-xs text-typography-500">Envios</Text>
          </View>
          <View className="w-px bg-outline-100" />
          <View className="flex-1 items-center gap-1">
            <Text
              className="text-2xl font-bold text-success-600"
              accessibilityLabel={`Economia total: ${formatCurrency(user?.totalSavings ?? 0)}`}
            >
              {formatCurrency(user?.totalSavings ?? 0)}
            </Text>
            <Text className="text-xs text-typography-500">Economia</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="mx-4 mt-4 gap-3">
        <TouchableOpacity
          onPress={handleViewSavings}
          accessibilityRole="button"
          accessibilityLabel="Ver Economia"
          className="rounded-2xl bg-background-0 p-4"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-success-50">
              <Ionicons name="trending-up" size={20} color="#05966A" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-typography-900">
                Historico de Economia
              </Text>
              <Text className="mt-0.5 text-xs text-typography-500">
                Veja economia mensal e compras recentes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C8C8C8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSettings}
          accessibilityRole="button"
          accessibilityLabel="Configuracoes"
          className="rounded-2xl bg-background-0 p-4"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-background-100">
              <Ionicons name="settings-outline" size={20} color="#5A5A5A" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-typography-900">
                Configuracoes
              </Text>
              <Text className="mt-0.5 text-xs text-typography-500">
                Gerencie suas preferencias
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C8C8C8" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
