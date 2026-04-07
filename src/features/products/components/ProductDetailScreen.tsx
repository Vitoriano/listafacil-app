import React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { logger } from '@/shared/utils/logger';
import { useProductImageUri } from '@/shared/hooks/useProductImageUri';
import { useCategoryName } from '../hooks/useCategoryName';
import { useProductDetail } from '../hooks/useProductDetail';

export function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const colors = useThemeColors();
  const { data: product, isLoading } = useProductDetail(id ?? null);
  const { uri: imageUri, loading: imageLoading } = useProductImageUri(product);
  const categoryName = useCategoryName(product);

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

  function handleAddToList() {
    router.push('/(tabs)/lists');
  }

  function handlePriceHistory() {
    router.push(`/products/prices/history?productId=${id}`);
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
        {/* Product image */}
        {imageLoading ? (
          <View className="mb-4 self-center items-center justify-center rounded-2xl bg-background-100" style={{ width: '25%', aspectRatio: 1 }}>
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : imageUri ? (
          <View className="mb-4 self-center overflow-hidden rounded-2xl bg-background-100" style={{ width: '25%' }}>
            <Image
              source={{ uri: imageUri }}
              className="w-full"
              style={{ aspectRatio: 1 }}
              resizeMode="contain"
              accessibilityLabel={`Imagem de ${product.name}`}
            />
          </View>
        ) : (
          <View
            className="mb-4 self-center items-center justify-center rounded-2xl bg-background-100"
            style={{ width: '25%', aspectRatio: 1 }}
            accessibilityLabel="Sem imagem disponivel"
          >
            <Ionicons name="image-outline" size={48} color={colors.textMuted} />
            <Text className="mt-2 text-xs text-typography-400">Sem imagem</Text>
          </View>
        )}

        {/* Product header card */}
        <View className="rounded-2xl bg-background-0 p-4">
          <Text className="text-xl font-bold text-typography-900">
            {product.name}
          </Text>
          <Text className="mt-1 text-sm text-typography-500">{product.brand}</Text>

          <View className="mt-3 flex-row flex-wrap gap-2">
            <View className="shrink rounded-full bg-primary-50 px-3 py-1.5">
              <Text className="text-xs font-semibold text-primary-600" numberOfLines={1}>
                {categoryName}
              </Text>
            </View>
            <View className="rounded-full bg-background-100 px-3 py-1.5">
              <Text className="text-xs text-typography-500">
                {product.unit}
              </Text>
            </View>
          </View>
        </View>

        {/* Price card */}
        <View className="mt-3 rounded-2xl bg-background-0 p-4">
          <Text className="mb-3 text-base font-bold text-typography-900">
            Ultimo Preco
          </Text>

          {product.latestPrice ? (
            <>
              <Text className="text-2xl font-bold text-success-600">
                {formatCurrency(product.latestPrice.price)}
              </Text>
              <View className="mt-2 flex-row items-center gap-1">
                <Ionicons name="storefront-outline" size={14} color={colors.textTertiary} />
                <Text className="text-xs text-typography-500">
                  {product.latestPrice.store.name}
                </Text>
              </View>
              <View className="mt-1 flex-row items-center gap-1">
                <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                <Text className="text-xs text-typography-500">
                  {formatDate(product.latestPrice.submittedAt)}
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-sm text-typography-400">
              Nenhum preco cadastrado ainda.
            </Text>
          )}
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
              <Text className="text-sm font-medium text-typography-900">{categoryName}</Text>
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
            <Ionicons name="swap-horizontal" size={20} color={colors.white} />
            <Text className="text-sm font-bold text-white">Comparar Precos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full border-2 border-primary-500 py-4"
            onPress={handleSubmitPrice}
            accessibilityRole="button"
            accessibilityLabel="Enviar Preco"
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text className="text-sm font-bold text-primary-500">
              Enviar Preco
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full border-2 border-outline-300 py-4"
            onPress={handlePriceHistory}
            accessibilityRole="button"
            accessibilityLabel="Histórico de Preços"
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={20} color={colors.icon} />
            <Text className="text-sm font-bold text-typography-700">
              Histórico de Preços
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full border-2 border-success-500 py-4"
            onPress={handleAddToList}
            accessibilityRole="button"
            accessibilityLabel="Adicionar à Lista"
            activeOpacity={0.7}
          >
            <Ionicons name="list-outline" size={20} color={colors.success} />
            <Text className="text-sm font-bold text-success-600">
              Adicionar à Lista
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
