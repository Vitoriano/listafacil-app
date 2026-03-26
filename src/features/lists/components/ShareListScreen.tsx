import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useListDetail } from '../hooks/useListDetail';
import { useListMembers } from '../hooks/useListMembers';
import {
  useShareByEmail,
  useGenerateInvite,
  useRemoveMember,
} from '../hooks/useShareList';
import type { SharedMember } from '../types';

type Tab = 'invite' | 'members' | 'scan';

export function ShareListScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<Tab>('invite');
  const [email, setEmail] = useState('');
  const [qrValue, setQrValue] = useState<string | null>(null);

  const colors = useThemeColors();
  const { data: list, isLoading: loadingList } = useListDetail(id ?? null);
  const { data: members, isLoading: loadingMembers } = useListMembers(id ?? null);
  const shareByEmail = useShareByEmail();
  const generateInvite = useGenerateInvite();
  const removeMember = useRemoveMember();

  // Generate QR invite on mount
  useEffect(() => {
    if (id && !qrValue) {
      generateInvite.mutate(
        { listId: id, role: 'editor' },
        {
          onSuccess: (result) => {
            setQrValue(result.shareUrl);
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleBack() {
    router.back();
  }

  function handleShareEmail() {
    const trimmed = email.trim();
    if (!trimmed || !id) return;

    shareByEmail.mutate(
      { listId: id, email: trimmed, role: 'editor' },
      {
        onSuccess: () => {
          setEmail('');
          Alert.alert('Convite Enviado', `Convite enviado para ${trimmed}`);
        },
      },
    );
  }

  function handleRemoveMember(member: SharedMember) {
    if (!id) return;
    Alert.alert(
      'Remover Membro',
      `Deseja remover ${member.name} da lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeMember.mutate({ listId: id, userId: member.userId }),
        },
      ],
    );
  }

  function handleRegenerateQR() {
    if (!id) return;
    setQrValue(null);
    generateInvite.mutate(
      { listId: id, role: 'editor' },
      {
        onSuccess: (result) => {
          setQrValue(result.shareUrl);
        },
      },
    );
  }

  function handleScanQR() {
    router.push('/lists/join');
  }

  if (loadingList) {
    return <LoadingSpinner />;
  }

  const tabs: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'invite', label: 'Convidar', icon: 'share-outline' },
    { key: 'members', label: 'Membros', icon: 'people-outline' },
    { key: 'scan', label: 'Escanear', icon: 'qr-code-outline' },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader
        title="Compartilhar Lista"
        subtitle={list?.name}
        onBack={handleBack}
      />

      {/* Tab bar */}
      <View className="flex-row bg-background-0 border-b border-outline-100 px-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className="flex-1 items-center py-3"
            activeOpacity={0.7}
          >
            <View
              className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
                activeTab === tab.key ? 'bg-primary-50' : ''
              }`}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.key ? '#EA1D2C' : '#7D7D7D'}
              />
              <Text
                className={`text-xs font-semibold ${
                  activeTab === tab.key ? 'text-primary-500' : 'text-typography-500'
                }`}
              >
                {tab.label}
              </Text>
            </View>
            {activeTab === tab.key ? (
              <View className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary-500" />
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        {/* ── TAB: Convidar ── */}
        {activeTab === 'invite' ? (
          <View className="gap-5">
            {/* Email invite */}
            <View className="rounded-2xl bg-background-0 p-4">
              <View className="mb-3 flex-row items-center gap-2">
                <Ionicons name="mail-outline" size={18} color={colors.icon} />
                <Text className="text-sm font-bold text-typography-900">
                  Convidar por Email
                </Text>
              </View>
              <Text className="mb-3 text-xs text-typography-500">
                A pessoa recebera um convite para colaborar na sua lista de compras.
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 rounded-xl border border-outline-200 bg-background-50 px-4 py-3 text-sm text-typography-900"
                  placeholder="email@exemplo.com"
                  placeholderTextColor={colors.textQuaternary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="send"
                  onSubmitEditing={handleShareEmail}
                  accessibilityLabel="Email para convite"
                />
                <TouchableOpacity
                  onPress={handleShareEmail}
                  disabled={!email.trim() || shareByEmail.isPending}
                  className={`h-12 w-12 items-center justify-center rounded-full ${
                    email.trim() ? 'bg-primary-500' : 'bg-outline-200'
                  }`}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Enviar convite"
                >
                  {shareByEmail.isPending ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <Ionicons
                      name="send"
                      size={18}
                      color={email.trim() ? '#FFFFFF' : '#A8A8A8'}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* QR Code */}
            <View className="rounded-2xl bg-background-0 p-4">
              <View className="mb-3 flex-row items-center gap-2">
                <Ionicons name="qr-code-outline" size={18} color={colors.icon} />
                <Text className="text-sm font-bold text-typography-900">
                  Compartilhar via QR Code
                </Text>
              </View>
              <Text className="mb-4 text-xs text-typography-500">
                Mostre este QR Code para que outra pessoa escaneie e entre na lista.
              </Text>

              <View className="items-center">
                {qrValue ? (
                  <View className="rounded-2xl bg-white p-5">
                    <QRCode
                      value={qrValue}
                      size={200}
                      color={colors.text}
                      backgroundColor="#FFFFFF"
                    />
                  </View>
                ) : (
                  <View className="h-52 w-52 items-center justify-center rounded-2xl bg-background-100">
                    <LoadingSpinner size="small" />
                    <Text className="mt-2 text-xs text-typography-400">
                      Gerando QR Code...
                    </Text>
                  </View>
                )}

                <Text className="mt-3 text-center text-xs text-typography-400">
                  Valido por 7 dias · Permissao de edicao
                </Text>

                <TouchableOpacity
                  onPress={handleRegenerateQR}
                  className="mt-3 flex-row items-center gap-1.5"
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={14} color={colors.primary} />
                  <Text className="text-xs font-semibold text-primary-500">
                    Gerar novo codigo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── TAB: Membros ── */}
        {activeTab === 'members' ? (
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="people" size={18} color={colors.icon} />
              <Text className="text-sm font-bold text-typography-900">
                Membros da Lista
              </Text>
              {members ? (
                <View className="rounded-full bg-primary-50 px-2 py-0.5">
                  <Text className="text-xs font-bold text-primary-500">
                    {members.length}
                  </Text>
                </View>
              ) : null}
            </View>

            {loadingMembers ? (
              <LoadingSpinner size="small" />
            ) : !members || members.length === 0 ? (
              <View className="items-center rounded-2xl bg-background-0 py-10">
                <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-background-100">
                  <Ionicons name="people-outline" size={24} color={colors.textTertiary} />
                </View>
                <Text className="text-sm font-semibold text-typography-700">
                  Nenhum membro
                </Text>
                <Text className="mt-1 text-xs text-typography-400">
                  Convide alguem para colaborar
                </Text>
              </View>
            ) : (
              members.map((member) => (
                <View
                  key={member.userId}
                  className="flex-row items-center rounded-2xl bg-background-0 p-4"
                >
                  <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-primary-100">
                    <Text className="text-base font-bold text-primary-600">
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-typography-900">
                      {member.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-typography-500">
                      {member.email}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className={`rounded-full px-2.5 py-1 ${
                      member.role === 'editor' ? 'bg-success-50' : 'bg-background-100'
                    }`}>
                      <Text className={`text-xs font-semibold ${
                        member.role === 'editor' ? 'text-success-700' : 'text-typography-500'
                      }`}>
                        {member.role === 'editor' ? 'Editor' : 'Leitor'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member)}
                      className="h-8 w-8 items-center justify-center rounded-full bg-error-50"
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${member.name}`}
                    >
                      <Ionicons name="close" size={14} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : null}

        {/* ── TAB: Escanear ── */}
        {activeTab === 'scan' ? (
          <View className="flex-1 items-center justify-center gap-5 py-10">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-50">
              <Ionicons name="qr-code" size={40} color={colors.primary} />
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-typography-900">
                Escanear QR Code
              </Text>
              <Text className="mt-1 text-center text-sm text-typography-500">
                Escaneie o QR Code de outra pessoa{'\n'}para entrar na lista dela.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleScanQR}
              className="flex-row items-center gap-2 rounded-full bg-primary-500 px-8 py-4"
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Abrir camera para escanear"
            >
              <Ionicons name="camera" size={20} color={colors.white} />
              <Text className="text-sm font-bold text-white">
                Abrir Camera
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
