import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useLists } from '../hooks/useLists';
import { useAddItem } from '../hooks/useAddItem';
import { useCreateList } from '../hooks/useCreateList';
import type { ShoppingList } from '../types';
import type { Product } from '@/features/products/types';

interface AddToListSheetProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

/**
 * Folha inferior "Adicionar à lista": escolhe (ou cria) a lista e adiciona o
 * produto sem sair da tela do produto. Evita o antigo desvio de 3 telas
 * (Listas → abrir lista → buscar o produto de novo).
 */
export function AddToListSheet({ visible, product, onClose }: AddToListSheetProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { data: lists, isLoading } = useLists();
  const { mutate: addItem, isPending: isAdding } = useAddItem();
  const { mutate: createList, isPending: isCreating } = useCreateList();
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);

  function reset() {
    setNewListName('');
    setShowNewList(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function addTo(list: { id: string; name: string }) {
    if (!product) return;
    logger.info('Lists', 'Adding product to list from product screen', product.id, list.id);
    addItem(
      {
        listId: list.id,
        item: { productId: product.id, quantity: 1, estimatedPrice: product.latestPrice?.price ?? 0 },
      },
      {
        onSuccess: () => {
          handleClose();
          Alert.alert('Adicionado', `${product.name} foi adicionado à lista "${list.name}".`, [
            { text: 'Continuar aqui', style: 'cancel' },
            { text: 'Ver lista', onPress: () => router.navigate(`/lists/${list.id}`) },
          ]);
        },
        onError: () => {
          Alert.alert('Erro', 'Não foi possível adicionar o item. Tente novamente.');
        },
      },
    );
  }

  function handleCreateAndAdd() {
    const name = newListName.trim();
    if (!name) return;
    createList(
      { name },
      {
        onSuccess: (list) => addTo({ id: list.id, name: list.name }),
        onError: () => Alert.alert('Erro', 'Não foi possível criar a lista.'),
      },
    );
  }

  const busy = isAdding || isCreating;
  const alreadyIn = (list: ShoppingList) =>
    !!product && list.items.some((i) => i.productId === product.id);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={handleClose} />
        <View className="max-h-[75%] rounded-t-3xl bg-background-0 px-5 pb-8 pt-4">
          <View className="mb-3 self-center h-1 w-10 rounded-full bg-outline-200" />
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-typography-900">Adicionar à lista</Text>
              {product ? (
                <Text className="mt-0.5 text-xs text-typography-500" numberOfLines={1}>
                  {product.name}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-background-100"
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>

          {busy ? (
            <View className="py-10">
              <LoadingSpinner size="small" />
            </View>
          ) : showNewList ? (
            <View className="gap-3">
              <TextInput
                className="rounded-xl border border-outline-200 bg-background-50 px-4 py-3.5 text-sm text-typography-900"
                placeholder="Nome da nova lista"
                placeholderTextColor={colors.textQuaternary}
                value={newListName}
                onChangeText={setNewListName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateAndAdd}
                accessibilityLabel="Nome da nova lista"
              />
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowNewList(false)}
                  className="flex-1 items-center rounded-full border-2 border-outline-200 py-3"
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-bold text-typography-500">Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateAndAdd}
                  disabled={!newListName.trim()}
                  className={`flex-1 items-center rounded-full py-3 ${
                    newListName.trim() ? 'bg-primary-500' : 'bg-primary-300'
                  }`}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Criar lista e adicionar"
                >
                  <Text className="text-sm font-bold text-white">Criar e adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : isLoading ? (
            <View className="py-10">
              <LoadingSpinner size="small" />
            </View>
          ) : (
            <FlatList
              data={lists ?? []}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <TouchableOpacity
                  onPress={() => setShowNewList(true)}
                  className="mb-2 flex-row items-center gap-3 rounded-2xl border border-dashed border-primary-300 p-3.5"
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Nova lista"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-50">
                    <Ionicons name="add" size={20} color={colors.primary} />
                  </View>
                  <Text className="text-sm font-bold text-primary-500">Nova lista</Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => {
                const inList = alreadyIn(item);
                return (
                  <TouchableOpacity
                    onPress={() => addTo(item)}
                    className="mb-2 flex-row items-center gap-3 rounded-2xl bg-background-50 p-3.5"
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Adicionar à lista ${item.name}`}
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-background-100">
                      <Ionicons name="list" size={18} color={colors.textSecondary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-typography-900">{item.name}</Text>
                      <Text className="mt-0.5 text-xs text-typography-500">
                        {item.itemCount} {item.itemCount === 1 ? 'item' : 'itens'}
                        {inList ? ' · já está nesta lista' : ''}
                      </Text>
                    </View>
                    <Ionicons
                      name={inList ? 'checkmark-circle' : 'add-circle-outline'}
                      size={22}
                      color={inList ? colors.success : colors.primary}
                    />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text className="py-6 text-center text-xs text-typography-400">
                  Você ainda não tem listas. Crie a primeira acima.
                </Text>
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
