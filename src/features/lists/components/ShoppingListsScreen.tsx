import React from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '../../../../components/ui/box';
import { VStack } from '../../../../components/ui/vstack';
import { HStack } from '../../../../components/ui/hstack';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { logger } from '@/shared/utils/logger';
import { useLists } from '../hooks/useLists';
import { useDeleteList } from '../hooks/useDeleteList';
import type { ShoppingList } from '../types';

export function ShoppingListsScreen() {
  const router = useRouter();
  const { data: lists, isLoading } = useLists();
  const { mutate: deleteList } = useDeleteList();

  function handleCreateList() {
    logger.info('Lists', 'Navigating to create list');
    router.push('/lists/create');
  }

  function handleListPress(list: ShoppingList) {
    logger.info('Lists', 'Navigating to list detail', list.id);
    router.push(`/lists/${list.id}`);
  }

  function handleDeleteList(list: ShoppingList) {
    logger.info('Lists', 'Deleting list', list.id);
    deleteList(list.id);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <VStack className="flex-1 bg-background-50">
      {/* Header */}
      <Box className="bg-background-0 px-4 pb-3 pt-4 shadow-sm">
        <HStack className="items-center justify-between">
          <Text className="text-2xl font-bold text-typography-900">
            Shopping Lists
          </Text>
          <TouchableOpacity
            onPress={handleCreateList}
            accessibilityRole="button"
            accessibilityLabel="Create List"
            className="rounded-lg bg-primary-500 px-4 py-2"
          >
            <Text className="text-sm font-semibold text-white">+ Create</Text>
          </TouchableOpacity>
        </HStack>
      </Box>

      {/* Lists */}
      <FlatList
        data={lists ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, flexGrow: 1 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleListPress(item)}
            accessibilityRole="button"
            accessibilityLabel={`Open list ${item.name}`}
            className="mb-3"
          >
            <Box className="rounded-xl bg-background-0 p-4 shadow-sm">
              <HStack className="items-start justify-between">
                <VStack className="flex-1">
                  <Text className="text-base font-semibold text-typography-900">
                    {item.name}
                  </Text>
                  <Text className="mt-1 text-sm text-typography-500">
                    {item.itemCount}{' '}
                    {item.itemCount === 1 ? 'item' : 'items'}
                  </Text>
                  <Text className="mt-0.5 text-xs text-typography-400">
                    {formatDate(item.createdAt)}
                  </Text>
                </VStack>
                <VStack className="items-end">
                  <Text className="text-lg font-bold text-primary-600">
                    {formatCurrency(item.totalEstimate)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteList(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete list ${item.name}`}
                    className="mt-2 rounded-lg bg-error-100 px-3 py-1.5"
                  >
                    <Text className="text-xs font-medium text-error-600">
                      Delete
                    </Text>
                  </TouchableOpacity>
                </VStack>
              </HStack>
            </Box>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Shopping Lists"
            message="Create your first shopping list to get started."
            action={{ label: 'Create List', onPress: handleCreateList }}
          />
        }
      />
    </VStack>
  );
}
