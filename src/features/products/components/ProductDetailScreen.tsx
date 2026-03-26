import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { logger } from '@/shared/utils/logger';
import { useProductDetail } from '../hooks/useProductDetail';

export function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading } = useProductDetail(id ?? null);

  function handleBack() {
    router.back();
  }

  function handleComparePrices() {
    logger.info('Products', 'Navigating to price comparison', id);
    router.push(`/products/prices?productId=${id}`);
  }

  function handleSubmitPrice() {
    logger.info('Products', 'Navigating to price submission', id);
    router.push(`/products/prices/submit?productId=${id}`);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background-50">
        <AppHeader title="Detalhe do Produto" onBack={handleBack} />
        <EmptyState
          title="Produto Nao Encontrado"
          message="O produto que voce procura nao existe."
          icon="alert-circle-outline"
          action={{ label: 'Voltar', onPress: handleBack }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title={product.name} onBack={handleBack} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Product image or placeholder */}
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            className="mb-4 h-48 w-full rounded-2xl"
            resizeMode="cover"
            accessibilityLabel={`Imagem de ${product.name}`}
          />
        ) : (
          <View
            className="mb-4 h-48 w-full items-center justify-center rounded-2xl bg-background-100"
            accessibilityLabel="Sem imagem disponivel"
          >
            <Ionicons name="image-outline" size={48} color="#C8C8C8" />
            <Text className="mt-2 text-xs text-typography-400">Sem imagem</Text>
          </View>
        )}

        {/* Product header card */}
        <View className="rounded-2xl bg-background-0 p-4">
          <Text className="text-xl font-bold text-typography-900">
            {product.name}
          </Text>
          <Text className="mt-1 text-sm text-typography-500">{product.brand}</Text>

          <View className="mt-3 flex-row gap-2">
            <View className="rounded-full bg-primary-50 px-3 py-1.5">
              <Text className="text-xs font-semibold text-primary-600">
                {product.category}
              </Text>
            </View>
            <View className="rounded-full bg-background-100 px-3 py-1.5">
              <Text className="text-xs text-typography-500">
                {product.unit}
              </Text>
            </View>
          </View>
        </View>

        {/* Price summary card */}
        <View className="mt-3 rounded-2xl bg-background-0 p-4">
          <Text className="mb-3 text-base font-bold text-typography-900">
            Resumo de Precos
          </Text>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-typography-400">Menor Preco</Text>
              <Text className="mt-0.5 text-2xl font-bold text-success-600">
                {formatCurrency(product.lowestPrice)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-typography-400">Preco Medio</Text>
              <Text className="mt-0.5 text-xl font-semibold text-typography-700">
                {formatCurrency(product.averagePrice)}
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center gap-1">
            <Ionicons name="people-outline" size={14} color="#7D7D7D" />
            <Text className="text-xs text-typography-500">
              {product.priceCount}{' '}
              {product.priceCount === 1 ? 'contribuicao' : 'contribuicoes'}
            </Text>
          </View>
        </View>

        {/* Product details card */}
        <View className="mt-3 rounded-2xl bg-background-0 p-4">
          <Text className="mb-3 text-base font-bold text-typography-900">
            Detalhes
          </Text>

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-typography-500">Codigo de Barras</Text>
              <Text className="font-mono text-sm font-medium text-typography-900">
                {product.barcode}
              </Text>
            </View>

            <View className="h-px bg-outline-100" />

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-typography-500">Categoria</Text>
              <Text className="text-sm font-medium text-typography-900">{product.category}</Text>
            </View>

            <View className="h-px bg-outline-100" />

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-typography-500">Unidade</Text>
              <Text className="text-sm font-medium text-typography-900">{product.unit}</Text>
            </View>

            <View className="h-px bg-outline-100" />

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-typography-500">Adicionado</Text>
              <Text className="text-sm font-medium text-typography-900">
                {formatDate(product.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View className="mt-4 gap-3">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-4"
            onPress={handleComparePrices}
            accessibilityRole="button"
            accessibilityLabel="Comparar Precos"
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">Comparar Precos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full border-2 border-primary-500 py-4"
            onPress={handleSubmitPrice}
            accessibilityRole="button"
            accessibilityLabel="Enviar Preco"
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color="#EA1D2C" />
            <Text className="text-sm font-bold text-primary-500">
              Enviar Preco
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
