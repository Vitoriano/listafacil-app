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
import { registerSchema, type RegisterFormData } from '../schemas/registerSchema';

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? 'Erro ao conectar com o servidor';
  }
  return 'Ocorreu um erro inesperado';
}

const FIELD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  name: 'person-outline',
  email: 'mail-outline',
  password: 'lock-closed-outline',
  confirmPassword: 'shield-checkmark-outline',
};

export function RegisterScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { register } = useAuth();

  const logoStyle = useAnimatedEntry({ delay: 0, translateY: 30 });
  const formStyle = useAnimatedEntry({ delay: 200, translateY: 25 });
  const footerStyle = useAnimatedEntry({ delay: 400, translateY: 20 });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false as unknown as true,
    },
  });

  const acceptedTerms = watch('acceptedTerms');

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
          <Animated.View style={logoStyle} className="items-center gap-3">
            <View className="mb-2 h-20 w-20 items-center justify-center rounded-3xl bg-primary-500 shadow-lg">
              <Ionicons name="person-add" size={36} color={colors.white} />
            </View>
            <Text className="text-3xl font-bold text-typography-900">
              Criar Conta
            </Text>
            <Text className="text-base text-typography-400">
              Junte-se ao Lista Fácil
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={formStyle} className="gap-4">
            {fields.map((field) => (
              <View key={field.name} className="gap-1.5">
                <Text className="text-xs font-bold uppercase tracking-wide text-typography-500">
                  {field.label}
                </Text>
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="relative">
                      <View className="absolute left-4 top-0 bottom-0 z-10 justify-center">
                        <Ionicons
                          name={FIELD_ICONS[field.name] ?? 'ellipse-outline'}
                          size={18}
                          color={colors.textQuaternary}
                        />
                      </View>
                      <TextInput
                        className={`rounded-2xl border bg-background-50 pl-11 pr-4 py-3.5 text-sm text-typography-900 ${
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
                    </View>
                  )}
                />
                {errors[field.name] ? (
                  <Text className="text-xs text-error-500">
                    {errors[field.name]?.message}
                  </Text>
                ) : null}
              </View>
            ))}

            {/* Terms acceptance */}
            <View className="gap-1.5">
              <TouchableOpacity
                onPress={() => setValue('acceptedTerms', !acceptedTerms as unknown as true, { shouldValidate: true })}
                className="flex-row items-start gap-3"
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: !!acceptedTerms }}
                accessibilityLabel="Aceitar termos de uso e política de privacidade"
              >
                <View
                  className={`mt-0.5 h-5 w-5 items-center justify-center rounded border-2 ${
                    acceptedTerms
                      ? 'border-primary-500 bg-primary-500'
                      : errors.acceptedTerms
                        ? 'border-error-500 bg-background-0'
                        : 'border-outline-300 bg-background-0'
                  }`}
                >
                  {acceptedTerms ? (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  ) : null}
                </View>

                <Text className="flex-1 text-xs leading-5 text-typography-500">
                  Li e concordo com os{' '}
                  <Text
                    className="font-bold text-primary-500"
                    onPress={() => router.push('/auth/legal?type=terms')}
                  >
                    Termos de Uso
                  </Text>
                  {' '}e a{' '}
                  <Text
                    className="font-bold text-primary-500"
                    onPress={() => router.push('/auth/legal?type=privacy')}
                  >
                    Política de Privacidade
                  </Text>
                  {' '}do Lista Fácil, incluindo o tratamento dos meus dados pessoais conforme a LGPD.
                </Text>
              </TouchableOpacity>

              {errors.acceptedTerms ? (
                <Text className="ml-8 text-xs text-error-500">
                  {errors.acceptedTerms.message}
                </Text>
              ) : null}
            </View>

            {/* API Error */}
            {register.isError ? (
              <View className="flex-row items-center gap-2 rounded-xl bg-error-50 px-4 py-3">
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text className="flex-1 text-sm text-error-600">
                  {getErrorMessage(register.error)}
                </Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              className={`mt-2 flex-row items-center justify-center gap-2 rounded-full py-4 shadow-sm ${
                register.isPending ? 'bg-primary-300' : 'bg-primary-500'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={register.isPending}
              accessibilityRole="button"
              accessibilityLabel="Criar Conta"
              activeOpacity={0.8}
            >
              {register.isPending ? (
                <Ionicons name="sync" size={18} color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
              )}
              <Text className="text-sm font-bold text-white">
                {register.isPending ? 'Criando conta...' : 'Criar Conta'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Login link */}
          <Animated.View style={footerStyle}>
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              accessibilityRole="button"
              accessibilityLabel="Ir para login"
              className="items-center py-2"
              activeOpacity={0.7}
            >
              <Text className="text-sm text-typography-500">
                Já tem uma conta?{' '}
                <Text className="font-bold text-primary-500">Entrar</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
