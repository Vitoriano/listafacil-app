import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '../../../../components/ui/box';
import { VStack } from '../../../../components/ui/vstack';
import { HStack } from '../../../../components/ui/hstack';
import { logger } from '@/shared/utils/logger';
import { useAuthStore } from '@/features/auth/stores/authStore';

export function SettingsScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  function handleLogout() {
    logger.info('Auth', 'User logging out');
    clearAuth();
    router.replace('/auth/login');
  }

  return (
    <VStack className="flex-1 bg-background-50">
      {/* Header */}
      <Box className="bg-background-0 px-4 pb-3 pt-4 shadow-sm">
        <Text className="text-2xl font-bold text-typography-900">Settings</Text>
      </Box>

      <VStack className="mx-4 mt-4 gap-3">
        {/* Account info */}
        {user ? (
          <Box className="rounded-xl bg-background-0 p-4 shadow-sm">
            <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-typography-400">
              Account
            </Text>
            <VStack className="mt-2 gap-1">
              <Text className="text-base font-semibold text-typography-900">
                {user.name}
              </Text>
              <Text className="text-sm text-typography-500">{user.email}</Text>
            </VStack>
          </Box>
        ) : null}

        {/* Logout */}
        <Box className="rounded-xl bg-background-0 shadow-sm">
          <TouchableOpacity
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Log Out"
            className="p-4"
          >
            <HStack className="items-center justify-between">
              <Text className="text-base font-semibold text-error-600">
                Log Out
              </Text>
              <Text className="text-xl text-error-400">›</Text>
            </HStack>
          </TouchableOpacity>
        </Box>
      </VStack>
    </VStack>
  );
}
