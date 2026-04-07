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
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { AxiosError } from 'axios';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useAnimatedEntry } from '@/shared/hooks/useAnimatedEntry';
import { logger } from '@/shared/utils/logger';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? 'Erro ao conectar com o servidor';
  }
  return 'Ocorreu um erro inesperado';
}

export function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { login } = useAuth();

  const logoStyle = useAnimatedEntry({ delay: 0, translateY: 30 });
  const formStyle = useAnimatedEntry({ delay: 200, translateY: 25 });
  const footerStyle = useAnimatedEntry({ delay: 400, translateY: 20 });

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
          <Animated.View style={logoStyle} className="items-center gap-3">
            <View className="mb-2 h-20 w-20 items-center justify-center rounded-3xl bg-primary-500 shadow-lg">
              <Ionicons name="cart" size={40} color={colors.white} />
            </View>
            <Text className="text-3xl font-bold text-typography-900">
              Lista Fácil
            </Text>
            <Text className="text-base text-typography-400">
              Economize nas suas compras
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={formStyle} className="gap-4">
            {/* Email */}
            <View className="gap-1.5">
              <Text className="text-xs font-bold uppercase tracking-wide text-typography-500">
                Email
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="relative">
                    <View className="absolute left-4 top-0 bottom-0 z-10 justify-center">
                      <Ionicons name="mail-outline" size={18} color={colors.textQuaternary} />
                    </View>
                    <TextInput
                      className={`rounded-2xl border bg-background-50 pl-11 pr-4 py-3.5 text-sm text-typography-900 ${
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
                  </View>
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
                  <View className="relative">
                    <View className="absolute left-4 top-0 bottom-0 z-10 justify-center">
                      <Ionicons name="lock-closed-outline" size={18} color={colors.textQuaternary} />
                    </View>
                    <TextInput
                      className={`rounded-2xl border bg-background-50 pl-11 pr-4 py-3.5 text-sm text-typography-900 ${
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
                  </View>
                )}
              />
              {errors.password ? (
                <Text className="text-xs text-error-500">
                  {errors.password.message}
                </Text>
              ) : null}
            </View>

            {/* API Error */}
            {login.isError ? (
              <View className="flex-row items-center gap-2 rounded-xl bg-error-50 px-4 py-3">
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text className="flex-1 text-sm text-error-600">
                  {getErrorMessage(login.error)}
                </Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              className={`mt-2 flex-row items-center justify-center gap-2 rounded-full py-4 shadow-sm ${
                login.isPending ? 'bg-primary-300' : 'bg-primary-500'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={login.isPending}
              accessibilityRole="button"
              accessibilityLabel="Entrar"
              activeOpacity={0.8}
            >
              {login.isPending ? (
                <Ionicons name="sync" size={18} color="#FFFFFF" />
              ) : (
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
              )}
              <Text className="text-sm font-bold text-white">
                {login.isPending ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Register link */}
          <Animated.View style={footerStyle}>
            <TouchableOpacity
              onPress={() => router.push('/auth/register')}
              accessibilityRole="button"
              accessibilityLabel="Criar conta"
              className="items-center py-2"
              activeOpacity={0.7}
            >
              <Text className="text-sm text-typography-500">
                Não tem uma conta?{' '}
                <Text className="font-bold text-primary-500">Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
