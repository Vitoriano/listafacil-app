import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppHeader } from '@/shared/components/AppHeader';
import { logger } from '@/shared/utils/logger';
import { storeRepository } from '@/data/repositories';
import { useSubmitPrice } from '../hooks/useSubmitPrice';
import { priceSubmitSchema, type PriceSubmitFormData } from '../schemas/priceSubmitSchema';
import type { Store } from '@/shared/types';

export function PriceSubmitScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PriceSubmitFormData>({
    resolver: zodResolver(priceSubmitSchema),
    defaultValues: {
      productId: productId ?? '',
      storeId: '',
      price: undefined,
    },
  });

  const selectedStoreId = watch('storeId');
  const { mutate: submitPrice, isPending } = useSubmitPrice();

  useEffect(() => {
    if (productId) {
      setValue('productId', productId);
    }
  }, [productId, setValue]);

  useEffect(() => {
    storeRepository
      .getAll()
      .then((allStores) => {
        setStores(allStores);
      })
      .finally(() => {
        setLoadingStores(false);
      });
  }, []);

  function handleBack() {
    router.back();
  }

  function onSubmit(data: PriceSubmitFormData) {
    logger.info('Prices', 'Submitting price', data);
    submitPrice(data, {
      onSuccess: () => {
        logger.info('Prices', 'Price submitted successfully');
        router.back();
      },
    });
  }

  if (loadingStores) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader title="Enviar Preco" onBack={handleBack} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="gap-4">
          {/* Store selector */}
          <View className="rounded-2xl bg-background-0 p-4">
            <Text className="mb-3 text-sm font-bold text-typography-900">
              Selecionar Loja
            </Text>
            <View className="gap-2">
              {stores.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  onPress={() => setValue('storeId', store.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar ${store.name}`}
                  accessibilityState={{ selected: selectedStoreId === store.id }}
                  className={`flex-row items-center gap-3 rounded-xl border-2 p-3.5 ${
                    selectedStoreId === store.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-outline-100 bg-background-50'
                  }`}
                  activeOpacity={0.7}
                >
                  <View className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selectedStoreId === store.id
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-outline-300'
                  }`}>
                    {selectedStoreId === store.id ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-semibold ${
                        selectedStoreId === store.id
                          ? 'text-primary-700'
                          : 'text-typography-700'
                      }`}
                    >
                      {store.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-typography-400">
                      {store.city}, {store.state}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {errors.storeId ? (
              <Text className="mt-2 text-xs text-error-500">
                {errors.storeId.message}
              </Text>
            ) : null}
          </View>

          {/* Price input */}
          <View className="rounded-2xl bg-background-0 p-4">
            <Text className="mb-3 text-sm font-bold text-typography-900">
              Preco (R$)
            </Text>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`rounded-xl border bg-background-50 px-4 py-3.5 text-lg font-bold text-typography-900 ${
                    errors.price ? 'border-error-500' : 'border-outline-200'
                  }`}
                  placeholder="0,00"
                  placeholderTextColor="#A8A8A8"
                  keyboardType="decimal-pad"
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const parsed = parseFloat(text.replace(',', '.'));
                    onChange(isNaN(parsed) ? undefined : parsed);
                  }}
                  value={value !== undefined ? String(value) : ''}
                  accessibilityLabel="Campo de preco"
                />
              )}
            />
            {errors.price ? (
              <Text className="mt-2 text-xs text-error-500">
                {errors.price.message}
              </Text>
            ) : null}
          </View>

          {/* Submit button */}
          <TouchableOpacity
            className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
              isPending ? 'bg-primary-300' : 'bg-primary-500'
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel="Enviar Preco"
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">
              {isPending ? 'Enviando...' : 'Enviar Preco'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
