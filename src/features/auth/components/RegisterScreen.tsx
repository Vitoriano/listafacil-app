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
import { logger } from '@/shared/utils/logger';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterFormData } from '../schemas/registerSchema';

export function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(data: RegisterFormData) {
    logger.info('Auth', 'Attempting registration', data.email);
    register.mutate(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: () => {
          logger.info('Auth', 'Registration successful');
          router.replace('/(tabs)');
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack className="gap-6">
          {/* Title */}
          <VStack className="items-center gap-2">
            <Text className="text-3xl font-bold text-typography-900">
              Create Account
            </Text>
            <Text className="text-base text-typography-500">
              Join Lista Fácil today
            </Text>
          </VStack>

          {/* Form */}
          <Box className="rounded-2xl bg-background-0 p-6 shadow-sm">
            <VStack className="gap-4">
              {/* Name */}
              <VStack className="gap-1">
                <Text className="text-sm font-medium text-typography-700">
                  Name
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`rounded-lg border p-3 text-base text-typography-900 ${
                        errors.name ? 'border-error-500' : 'border-outline-200'
                      }`}
                      placeholder="Your name"
                      autoCapitalize="words"
                      autoComplete="name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      accessibilityLabel="Name input"
                    />
                  )}
                />
                {errors.name ? (
                  <Text className="text-sm text-error-600">
                    {errors.name.message}
                  </Text>
                ) : null}
              </VStack>

              {/* Email */}
              <VStack className="gap-1">
                <Text className="text-sm font-medium text-typography-700">
                  Email
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`rounded-lg border p-3 text-base text-typography-900 ${
                        errors.email ? 'border-error-500' : 'border-outline-200'
                      }`}
                      placeholder="your@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      accessibilityLabel="Email input"
                    />
                  )}
                />
                {errors.email ? (
                  <Text className="text-sm text-error-600">
                    {errors.email.message}
                  </Text>
                ) : null}
              </VStack>

              {/* Password */}
              <VStack className="gap-1">
                <Text className="text-sm font-medium text-typography-700">
                  Password
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`rounded-lg border p-3 text-base text-typography-900 ${
                        errors.password
                          ? 'border-error-500'
                          : 'border-outline-200'
                      }`}
                      placeholder="••••••"
                      secureTextEntry
                      autoComplete="new-password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      accessibilityLabel="Password input"
                    />
                  )}
                />
                {errors.password ? (
                  <Text className="text-sm text-error-600">
                    {errors.password.message}
                  </Text>
                ) : null}
              </VStack>

              {/* Confirm Password */}
              <VStack className="gap-1">
                <Text className="text-sm font-medium text-typography-700">
                  Confirm Password
                </Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`rounded-lg border p-3 text-base text-typography-900 ${
                        errors.confirmPassword
                          ? 'border-error-500'
                          : 'border-outline-200'
                      }`}
                      placeholder="••••••"
                      secureTextEntry
                      autoComplete="new-password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      accessibilityLabel="Confirm Password input"
                    />
                  )}
                />
                {errors.confirmPassword ? (
                  <Text className="text-sm text-error-600">
                    {errors.confirmPassword.message}
                  </Text>
                ) : null}
              </VStack>

              {/* Submit */}
              <TouchableOpacity
                className={`mt-2 items-center rounded-xl py-4 ${
                  register.isPending ? 'bg-primary-300' : 'bg-primary-500'
                }`}
                onPress={handleSubmit(onSubmit)}
                disabled={register.isPending}
                accessibilityRole="button"
                accessibilityLabel="Create Account"
              >
                <Text className="text-base font-semibold text-white">
                  {register.isPending ? 'Creating account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </VStack>
          </Box>

          {/* Login link */}
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            accessibilityRole="button"
            accessibilityLabel="Go to Login"
            className="items-center py-2"
          >
            <Text className="text-sm text-typography-500">
              Already have an account?{' '}
              <Text className="font-semibold text-primary-500">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
