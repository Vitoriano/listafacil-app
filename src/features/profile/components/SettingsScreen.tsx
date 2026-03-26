import React from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@/shared/utils/logger';
import { useAuthStore } from '@/features/auth/stores/authStore';

export function SettingsScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  function handleLogout() {
    logger.info('Auth', 'User logging out');
    clearAuth();
    router.replace('/auth/login');
  }

  return (
    <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
      {/* Header */}
      <View className="bg-background-0 border-b border-outline-100 px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold text-typography-900">Configuracoes</Text>
      </View>

      <View className="mx-4 mt-4 gap-3">
        {/* Account info */}
        {user ? (
          <View className="rounded-2xl bg-background-0 p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-500">
                <Text className="text-lg font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-typography-900">
                  {user.name}
                </Text>
                <Text className="mt-0.5 text-xs text-typography-500">{user.email}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Sair"
          className="rounded-2xl bg-background-0 p-4"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-error-50">
              <Ionicons name="log-out-outline" size={20} color="#C41C1C" />
            </View>
            <Text className="flex-1 text-sm font-bold text-error-600">
              Sair da Conta
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#C8C8C8" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
