import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';

export function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-0"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: androidPadding }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-8">
          {/* Logo & Title */}
          <View className="items-center gap-3">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-500">
              <Ionicons name="cart" size={32} color={colors.white} />
            </View>
            <Text className="text-3xl font-bold text-typography-900">
              Lista Facil
            </Text>
            <Text className="text-sm text-typography-500">
              Entre na sua conta
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Email */}
            <View className="gap-1.5">
              <Text className="text-xs font-bold uppercase tracking-wide text-typography-500">
                Email
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`rounded-2xl border bg-background-50 px-4 py-3.5 text-sm text-typography-900 ${
                      errors.email ? 'border-error-500' : 'border-outline-200'
                    }`}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.textQuaternary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    accessibilityLabel="Campo de email"
                  />
                )}
              />
              {errors.email ? (
                <Text className="text-xs text-error-500">
                  {errors.email.message}
                </Text>
              ) : null}
            </View>

            {/* Password */}
            <View className="gap-1.5">
              <Text className="text-xs font-bold uppercase tracking-wide text-typography-500">
                Senha
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`rounded-2xl border bg-background-50 px-4 py-3.5 text-sm text-typography-900 ${
                      errors.password ? 'border-error-500' : 'border-outline-200'
                    }`}
                    placeholder="******"
                    placeholderTextColor={colors.textQuaternary}
                    secureTextEntry
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    accessibilityLabel="Campo de senha"
                  />
                )}
              />
              {errors.password ? (
                <Text className="text-xs text-error-500">
                  {errors.password.message}
                </Text>
              ) : null}
            </View>

            {/* Submit */}
            <TouchableOpacity
              className={`mt-2 items-center rounded-full py-4 ${
                login.isPending ? 'bg-primary-300' : 'bg-primary-500'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={login.isPending}
              accessibilityRole="button"
              accessibilityLabel="Entrar"
              activeOpacity={0.8}
            >
              <Text className="text-sm font-bold text-white">
                {login.isPending ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            accessibilityRole="button"
            accessibilityLabel="Criar conta"
            className="items-center py-2"
            activeOpacity={0.7}
          >
            <Text className="text-sm text-typography-500">
              Nao tem uma conta?{' '}
              <Text className="font-bold text-primary-500">Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
