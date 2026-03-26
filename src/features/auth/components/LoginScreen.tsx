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
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(data: LoginFormData) {
    logger.info('Auth', 'Attempting login', data.email);
    login.mutate(data, {
      onSuccess: () => {
        logger.info('Auth', 'Login successful');
        router.replace('/(tabs)');
      },
    });
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
              Lista Fácil
            </Text>
            <Text className="text-base text-typography-500">
              Sign in to your account
            </Text>
          </VStack>

          {/* Form */}
          <Box className="rounded-2xl bg-background-0 p-6 shadow-sm">
            <VStack className="gap-4">
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
                        errors.password ? 'border-error-500' : 'border-outline-200'
                      }`}
                      placeholder="••••••"
                      secureTextEntry
                      autoComplete="password"
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

              {/* Submit */}
              <TouchableOpacity
                className={`mt-2 items-center rounded-xl py-4 ${
                  login.isPending ? 'bg-primary-300' : 'bg-primary-500'
                }`}
                onPress={handleSubmit(onSubmit)}
                disabled={login.isPending}
                accessibilityRole="button"
                accessibilityLabel="Sign In"
              >
                <Text className="text-base font-semibold text-white">
                  {login.isPending ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </VStack>
          </Box>

          {/* Register link */}
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            accessibilityRole="button"
            accessibilityLabel="Go to Register"
            className="items-center py-2"
          >
            <Text className="text-sm text-typography-500">
              Don&apos;t have an account?{' '}
              <Text className="font-semibold text-primary-500">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
