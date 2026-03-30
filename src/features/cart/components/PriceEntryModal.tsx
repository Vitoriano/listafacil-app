import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { Product } from '@/features/products/types';

interface PriceEntryModalProps {
  visible: boolean;
  product: Product | null;
  onAdd: (price: number, quantity: number) => void;
  onClose: () => void;
}

export function PriceEntryModal({ visible, product, onAdd, onClose }: PriceEntryModalProps) {
  const colors = useThemeColors();
  const [priceText, setPriceText] = useState('');
  const [quantity, setQuantity] = useState(1);

  function handleAdd() {
    const parsed = parseFloat(priceText.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;
    onAdd(parsed, quantity);
    setPriceText('');
    setQuantity(1);
  }

  function handleClose() {
    setPriceText('');
    setQuantity(1);
    onClose();
  }

  if (!product) return null;

  const parsedPrice = parseFloat(priceText.replace(',', '.'));
  const isValid = !isNaN(parsedPrice) && parsedPrice > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-background-50"
      >
        {/* Header */}
        <View className="bg-background-0 px-5 pb-4 pt-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              className="h-10 w-10 items-center justify-center rounded-full bg-background-50"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color={colors.icon} />
            </TouchableOpacity>
            <Text className="text-base font-bold text-typography-900">
              Adicionar Produto
            </Text>
            <View className="h-10 w-10" />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product card */}
          <View className="rounded-2xl bg-background-0 p-5">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                <Ionicons name="cube-outline" size={26} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-typography-900">
                  {product.name}
                </Text>
                <Text className="mt-0.5 text-sm text-typography-500">
                  {product.brand} · {product.unit}
                </Text>
              </View>
            </View>

            {/* Reference price */}
            {product.latestPrice ? (
              <View className="mt-4 rounded-xl bg-success-50 p-3">
                <Text className="text-xs text-success-600">Ultimo preco</Text>
                <Text className="mt-0.5 text-lg font-bold text-success-600">
                  {formatCurrency(product.latestPrice.price)}
                </Text>
                <Text className="mt-0.5 text-xs text-success-500">
                  {product.latestPrice.store.name}
                </Text>
              </View>
            ) : (
              <View className="mt-4 rounded-xl bg-background-50 p-3">
                <Text className="text-xs text-typography-400">Sem preco cadastrado</Text>
              </View>
            )}
          </View>

          {/* Price input */}
          <View className="mt-4 rounded-2xl bg-background-0 p-5">
            <Text className="mb-3 text-sm font-bold text-typography-900">
              Qual o preco deste produto?
            </Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-lg font-bold text-typography-400">R$</Text>
              <TextInput
                className="flex-1 rounded-2xl bg-background-50 px-4 py-4 text-2xl font-bold text-typography-900"
                placeholder="0,00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={priceText}
                onChangeText={setPriceText}
                autoFocus
                accessibilityLabel="Campo de preco"
              />
            </View>
          </View>

          {/* Quantity */}
          <View className="mt-4 rounded-2xl bg-background-0 p-5">
            <Text className="mb-3 text-sm font-bold text-typography-900">
              Quantidade
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-5">
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-12 w-12 items-center justify-center rounded-full bg-background-100"
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={22} color={colors.icon} />
                </TouchableOpacity>
                <Text className="min-w-[40px] text-center text-3xl font-bold text-typography-900">
                  {quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => q + 1)}
                  className="h-12 w-12 items-center justify-center rounded-full bg-primary-50"
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {isValid ? (
                <View className="items-end">
                  <Text className="text-xs text-typography-400">Subtotal</Text>
                  <Text className="text-xl font-bold text-primary-500">
                    {formatCurrency(parsedPrice * quantity)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>

        {/* Bottom button */}
        <View
          className="bg-background-0 px-5 pt-4"
          style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16 }}
        >
          <TouchableOpacity
            className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
              isValid ? 'bg-primary-500' : 'bg-primary-300'
            }`}
            onPress={handleAdd}
            disabled={!isValid}
            accessibilityRole="button"
            accessibilityLabel="Adicionar ao carrinho"
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={20} color={colors.white} />
            <Text className="text-sm font-bold text-white">
              {isValid
                ? `Adicionar · ${formatCurrency(parsedPrice * quantity)}`
                : 'Informe o preco'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
