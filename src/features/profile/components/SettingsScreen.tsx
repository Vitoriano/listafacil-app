import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { APP_NAME } from '@/config/constants';

export function SettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const [editingName, setEditingName] = useState(false);
  const [nameText, setNameText] = useState(user?.name ?? '');

  function handleBack() {
    router.back();
  }

  function handleLogout() {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            logger.info('Auth', 'User logging out');
            clearAuth();
            router.replace('/auth/login');
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Configurações" onBack={handleBack} />

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
              <TouchableOpacity
                onPress={() => setEditingName(!editingName)}
                className="h-9 w-9 items-center justify-center rounded-full bg-background-100"
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Editar perfil"
              >
                <Ionicons name="pencil-outline" size={16} color={colors.icon} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Menu items */}
        <View className="rounded-2xl bg-background-0">
          <TouchableOpacity
            onPress={() => router.push('/profile/savings')}
            className="flex-row items-center gap-3 border-b border-outline-100 p-4"
            activeOpacity={0.7}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-success-50">
              <Ionicons name="trending-up" size={18} color={colors.success} />
            </View>
            <Text className="flex-1 text-sm font-semibold text-typography-900">Economia</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/cart/history')}
            className="flex-row items-center gap-3 p-4"
            activeOpacity={0.7}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-info-50">
              <Ionicons name="receipt-outline" size={18} color={colors.info} />
            </View>
            <Text className="flex-1 text-sm font-semibold text-typography-900">Histórico de Compras</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* About section */}
        <View className="rounded-2xl bg-background-0">
          <View className="flex-row items-center justify-between border-b border-outline-100 p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-background-100">
                <Ionicons name="information-circle-outline" size={18} color={colors.icon} />
              </View>
              <Text className="text-sm font-semibold text-typography-900">Versão</Text>
            </View>
            <Text className="text-sm text-typography-400">1.0.0</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/profile/legal?type=terms')}
            className="flex-row items-center gap-3 border-b border-outline-100 p-4"
            activeOpacity={0.7}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-background-100">
              <Ionicons name="document-text-outline" size={18} color={colors.icon} />
            </View>
            <Text className="flex-1 text-sm font-semibold text-typography-900">Termos de Uso</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/profile/legal?type=privacy')}
            className="flex-row items-center gap-3 p-4"
            activeOpacity={0.7}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-background-100">
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.icon} />
            </View>
            <Text className="flex-1 text-sm font-semibold text-typography-900">Política de Privacidade</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Sair"
          className="rounded-2xl bg-background-0 p-4"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-error-50">
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
            </View>
            <Text className="flex-1 text-sm font-bold text-error-600">Sair da Conta</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <Text className="mt-2 text-center text-xs text-typography-400">
          {APP_NAME} · Feito com ❤️ no Brasil
        </Text>
      </View>
    </View>
  );
}
