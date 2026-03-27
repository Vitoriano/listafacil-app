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
import { AxiosError } from 'axios';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterFormData } from '../schemas/registerSchema';

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? 'Erro ao conectar com o servidor';
  }
  return 'Ocorreu um erro inesperado';
}

export function RegisterScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  const fields = [
    { name: 'name' as const, label: 'Nome', placeholder: 'Seu nome', autoComplete: 'name' as const, autoCapitalize: 'words' as const },
    { name: 'email' as const, label: 'Email', placeholder: 'seu@email.com', autoComplete: 'email' as const, autoCapitalize: 'none' as const, keyboardType: 'email-address' as const },
    { name: 'password' as const, label: 'Senha', placeholder: '******', autoComplete: 'new-password' as const, secure: true },
    { name: 'confirmPassword' as const, label: 'Confirmar Senha', placeholder: '******', autoComplete: 'new-password' as const, secure: true },
  ];

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
          {/* Title */}
          <View className="items-center gap-3">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-500">
              <Ionicons name="person-add" size={32} color={colors.white} />
            </View>
            <Text className="text-3xl font-bold text-typography-900">
              Criar Conta
            </Text>
            <Text className="text-sm text-typography-500">
              Junte-se ao Lista Facil
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {fields.map((field) => (
              <View key={field.name} className="gap-1.5">
                <Text className="text-xs font-bold uppercase tracking-wide text-typography-500">
                  {field.label}
                </Text>
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`rounded-2xl border bg-background-50 px-4 py-3.5 text-sm text-typography-900 ${
                        errors[field.name] ? 'border-error-500' : 'border-outline-200'
                      }`}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.textQuaternary}
                      keyboardType={field.keyboardType}
                      autoCapitalize={field.autoCapitalize}
                      autoComplete={field.autoComplete}
                      secureTextEntry={field.secure}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      accessibilityLabel={`Campo de ${field.label.toLowerCase()}`}
                    />
                  )}
                />
                {errors[field.name] ? (
                  <Text className="text-xs text-error-500">
                    {errors[field.name]?.message}
                  </Text>
                ) : null}
              </View>
            ))}

            {/* API Error */}
            {register.isError ? (
              <View className="rounded-xl bg-error-50 px-4 py-3">
                <Text className="text-sm text-error-600">
                  {getErrorMessage(register.error)}
                </Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              className={`mt-2 items-center rounded-full py-4 ${
                register.isPending ? 'bg-primary-300' : 'bg-primary-500'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={register.isPending}
              accessibilityRole="button"
              accessibilityLabel="Criar Conta"
              activeOpacity={0.8}
            >
              <Text className="text-sm font-bold text-white">
                {register.isPending ? 'Criando conta...' : 'Criar Conta'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            accessibilityRole="button"
            accessibilityLabel="Ir para login"
            className="items-center py-2"
            activeOpacity={0.7}
          >
            <Text className="text-sm text-typography-500">
              Ja tem uma conta?{' '}
              <Text className="font-bold text-primary-500">Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
