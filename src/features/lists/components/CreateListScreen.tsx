import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box } from '../../../../components/ui/box';
import { VStack } from '../../../../components/ui/vstack';
import { AppHeader } from '@/shared/components/AppHeader';
import { logger } from '@/shared/utils/logger';
import { useCreateList } from '../hooks/useCreateList';
import { createListSchema, type CreateListFormData } from '../schemas/createListSchema';

export function CreateListScreen() {
  const router = useRouter();
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
      <AppHeader title="Create List" onBack={handleBack} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack className="gap-4">
          <Box className="rounded-xl bg-background-0 p-4 shadow-sm">
            <Text className="mb-2 text-base font-semibold text-typography-900">
              List Name
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`rounded-lg border p-3 text-base text-typography-900 ${
                    errors.name ? 'border-error-500' : 'border-outline-200'
                  }`}
                  placeholder="e.g. Weekly Groceries"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  accessibilityLabel="List name input"
                  returnKeyType="done"
                />
              )}
            />
            {errors.name ? (
              <Text className="mt-1 text-sm text-error-600">
                {errors.name.message}
              </Text>
            ) : null}
          </Box>

          <TouchableOpacity
            className={`items-center rounded-xl py-4 ${
              isPending ? 'bg-primary-300' : 'bg-primary-500'
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel="Create List"
          >
            <Text className="text-base font-semibold text-white">
              {isPending ? 'Creating...' : 'Create List'}
            </Text>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
