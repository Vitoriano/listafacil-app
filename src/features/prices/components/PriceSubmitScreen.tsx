import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box } from '../../../../components/ui/box';
import { VStack } from '../../../../components/ui/vstack';
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
      <AppHeader title="Submit Price" onBack={handleBack} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack className="gap-4">
          {/* Store selector */}
          <Box className="rounded-xl bg-background-0 p-4 shadow-sm">
            <Text className="mb-2 text-base font-semibold text-typography-900">
              Select Store
            </Text>
            <VStack className="gap-2">
              {stores.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  onPress={() => setValue('storeId', store.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${store.name}`}
                  accessibilityState={{ selected: selectedStoreId === store.id }}
                  className={`rounded-lg border p-3 ${
                    selectedStoreId === store.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-outline-200 bg-background-50'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
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
                </TouchableOpacity>
              ))}
            </VStack>
            {errors.storeId ? (
              <Text className="mt-1 text-sm text-error-600">
                {errors.storeId.message}
              </Text>
            ) : null}
          </Box>

          {/* Price input */}
          <Box className="rounded-xl bg-background-0 p-4 shadow-sm">
            <Text className="mb-2 text-base font-semibold text-typography-900">
              Price (R$)
            </Text>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`rounded-lg border p-3 text-base text-typography-900 ${
                    errors.price ? 'border-error-500' : 'border-outline-200'
                  }`}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const parsed = parseFloat(text.replace(',', '.'));
                    onChange(isNaN(parsed) ? undefined : parsed);
                  }}
                  value={value !== undefined ? String(value) : ''}
                  accessibilityLabel="Price input"
                />
              )}
            />
            {errors.price ? (
              <Text className="mt-1 text-sm text-error-600">
                {errors.price.message}
              </Text>
            ) : null}
          </Box>

          {/* Submit button */}
          <TouchableOpacity
            className={`items-center rounded-xl py-4 ${
              isPending ? 'bg-primary-300' : 'bg-primary-500'
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel="Submit Price"
          >
            <Text className="text-base font-semibold text-white">
              {isPending ? 'Submitting...' : 'Submit Price'}
            </Text>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
