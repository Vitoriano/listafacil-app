import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '../../../../components/ui/box';
import { VStack } from '../../../../components/ui/vstack';
import { HStack } from '../../../../components/ui/hstack';
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <VStack className="flex-1 bg-background-50">
      {/* Header */}
      <Box className="bg-background-0 px-4 pb-6 pt-4 shadow-sm">
        <VStack className="items-center gap-3">
          {/* Avatar placeholder */}
          <Box
            className="h-20 w-20 items-center justify-center rounded-full bg-primary-100"
            accessibilityRole="image"
            accessibilityLabel="User avatar"
          >
            <Text className="text-3xl font-bold text-primary-600">
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </Box>

          <VStack className="items-center gap-1">
            <Text className="text-xl font-bold text-typography-900">
              {user?.name ?? '—'}
            </Text>
            <Text className="text-sm text-typography-500">
              {user?.email ?? '—'}
            </Text>
          </VStack>
        </VStack>
      </Box>

      {/* Stats */}
      <Box className="mx-4 mt-4 rounded-xl bg-background-0 p-4 shadow-sm">
        <Text className="mb-3 text-base font-semibold text-typography-900">
          Statistics
        </Text>
        <HStack className="justify-around">
          <VStack className="items-center gap-1">
            <Text
              className="text-2xl font-bold text-primary-600"
              accessibilityLabel={`Total submissions: ${user?.totalSubmissions ?? 0}`}
            >
              {user?.totalSubmissions ?? 0}
            </Text>
            <Text className="text-xs text-typography-500">Submissions</Text>
          </VStack>
          <Box className="w-px bg-outline-200" />
          <VStack className="items-center gap-1">
            <Text
              className="text-2xl font-bold text-primary-600"
              accessibilityLabel={`Total savings: ${formatCurrency(user?.totalSavings ?? 0)}`}
            >
              {formatCurrency(user?.totalSavings ?? 0)}
            </Text>
            <Text className="text-xs text-typography-500">Total Savings</Text>
          </VStack>
        </HStack>
      </Box>

      {/* Actions */}
      <VStack className="mx-4 mt-4 gap-3">
        <TouchableOpacity
          onPress={handleViewSavings}
          accessibilityRole="button"
          accessibilityLabel="View Savings"
          className="rounded-xl bg-background-0 p-4 shadow-sm"
        >
          <HStack className="items-center justify-between">
            <VStack className="gap-0.5">
              <Text className="text-base font-semibold text-typography-900">
                Savings History
              </Text>
              <Text className="text-sm text-typography-500">
                View monthly savings and recent purchases
              </Text>
            </VStack>
            <Text className="text-xl text-typography-400">›</Text>
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSettings}
          accessibilityRole="button"
          accessibilityLabel="Go to Settings"
          className="rounded-xl bg-background-0 p-4 shadow-sm"
        >
          <HStack className="items-center justify-between">
            <VStack className="gap-0.5">
              <Text className="text-base font-semibold text-typography-900">
                Settings
              </Text>
              <Text className="text-sm text-typography-500">
                Manage your account preferences
              </Text>
            </VStack>
            <Text className="text-xl text-typography-400">›</Text>
          </HStack>
        </TouchableOpacity>
      </VStack>
    </VStack>
  );
}
