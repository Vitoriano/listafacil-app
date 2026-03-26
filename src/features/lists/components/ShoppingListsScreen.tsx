import React from 'react';
import { FlatList, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

  function handleJoinList() {
    logger.info('Lists', 'Navigating to join list');
    router.push('/lists/join');
  }

  function handleListPress(list: ShoppingList) {
    logger.info('Lists', 'Navigating to list detail', list.id);
    router.push(`/lists/${list.id}`);
  }

  function handleDeleteList(list: ShoppingList) {
    logger.info('Lists', 'Deleting list', list.id);
    deleteList(list.id);
  }

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
      {/* Header */}
      <View className="bg-background-0 border-b border-outline-100 px-4 pb-3 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-typography-900">
            Minhas Listas
          </Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleJoinList}
              accessibilityRole="button"
              accessibilityLabel="Entrar em uma lista"
              className="h-10 w-10 items-center justify-center rounded-full bg-background-50"
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code-outline" size={20} color="#323232" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreateList}
              accessibilityRole="button"
              accessibilityLabel="Criar Lista"
              className="flex-row items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5"
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">Nova Lista</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Lists */}
      <FlatList
        data={lists ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleListPress(item)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir lista ${item.name}`}
            className="mb-3"
            activeOpacity={0.7}
          >
            <View className="rounded-2xl bg-background-0 p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-base font-bold text-typography-900">
                    {item.name}
                  </Text>
                  <View className="mt-1 flex-row items-center gap-1">
                    <Ionicons name="cart-outline" size={13} color="#7D7D7D" />
                    <Text className="text-xs text-typography-500">
                      {item.itemCount}{' '}
                      {item.itemCount === 1 ? 'item' : 'itens'}
                    </Text>
                  </View>
                  <Text className="mt-0.5 text-xs text-typography-400">
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold text-primary-500">
                    {formatCurrency(item.totalEstimate)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteList(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir lista ${item.name}`}
                    className="mt-2 flex-row items-center gap-1 rounded-full bg-error-50 px-3 py-1.5"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={12} color="#C41C1C" />
                    <Text className="text-xs font-semibold text-error-600">
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Nenhuma Lista"
            message="Crie sua primeira lista de compras para comecar."
            icon="list-outline"
            action={{ label: 'Criar Lista', onPress: handleCreateList }}
          />
        }
      />
    </View>
  );
}
