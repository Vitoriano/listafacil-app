import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useCreateList } from '../hooks/useCreateList';
import { createListSchema, type CreateListFormData } from '../schemas/createListSchema';

export function CreateListScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { mutate: createList, isPending } = useCreateList();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateListFormData>({
    resolver: zodResolver(createListSchema),
    defaultValues: { name: '' },
  });

  function handleBack() {
    router.back();
  }

  function onSubmit(data: CreateListFormData) {
    logger.info('Lists', 'Creating new list', data.name);
    createList(data, {
      onSuccess: () => {
        logger.info('Lists', 'List created successfully');
        router.back();
      },
    });
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader title="Nova Lista" onBack={handleBack} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="gap-4">
          <View className="rounded-2xl bg-background-0 p-4">
            <Text className="mb-3 text-sm font-bold text-typography-900">
              Nome da Lista
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`rounded-xl border bg-background-50 px-4 py-3.5 text-sm text-typography-900 ${
                    errors.name ? 'border-error-500' : 'border-outline-200'
                  }`}
                  placeholder="Ex: Compras da Semana"
                  placeholderTextColor={colors.textQuaternary}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  accessibilityLabel="Campo nome da lista"
                  returnKeyType="done"
                />
              )}
            />
            {errors.name ? (
              <Text className="mt-2 text-xs text-error-500">
                {errors.name.message}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
              isPending ? 'bg-primary-300' : 'bg-primary-500'
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel="Criar Lista"
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text className="text-sm font-bold text-white">
              {isPending ? 'Criando...' : 'Criar Lista'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
