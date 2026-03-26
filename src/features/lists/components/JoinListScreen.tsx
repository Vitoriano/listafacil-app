import React, { useEffect, useState } from 'react';
import { Alert, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useJoinByInvite } from '../hooks/useShareList';
import { useInvite } from '../hooks/useInvite';
import { useScanner } from '@/features/scanner/hooks/useScanner';

export function JoinListScreen() {
  const router = useRouter();
  const {
    permissionGranted,
    requestPermission,
    isPaused,
    scannedBarcode,
    handleBarcodeScanned,
    resumeScan,
  } = useScanner();

  const colors = useThemeColors();
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: invite, isLoading: loadingInvite } = useInvite(inviteId);
  const joinByInvite = useJoinByInvite();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Parse QR code value to extract invite id
  useEffect(() => {
    if (scannedBarcode && !inviteId) {
      // Expected format: listafacil://join/{inviteId}
      const match = scannedBarcode.match(/join\/(.+)$/);
      if (match) {
        setInviteId(match[1]);
        setShowConfirm(true);
      } else {
        Alert.alert(
          'QR Code Invalido',
          'Este QR Code nao e um convite valido do Lista Facil.',
          [{ text: 'OK', onPress: resumeScan }],
        );
      }
    }
  }, [scannedBarcode, inviteId, resumeScan]);

  function handleJoin() {
    if (!inviteId) return;

    joinByInvite.mutate(inviteId, {
      onSuccess: (list) => {
        Alert.alert(
          'Pronto!',
          `Voce entrou na lista "${list.name}". Agora ambos podem adicionar itens.`,
          [
            {
              text: 'Ver Lista',
              onPress: () => router.replace(`/lists/${list.id}`),
            },
          ],
        );
      },
      onError: () => {
        Alert.alert('Erro', 'Nao foi possivel entrar na lista. Tente novamente.');
        setInviteId(null);
        setShowConfirm(false);
        resumeScan();
      },
    });
  }

  function handleCancel() {
    setInviteId(null);
    setShowConfirm(false);
    resumeScan();
  }

  function handleBack() {
    router.back();
  }

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  if (!permissionGranted) {
    return (
      <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
        <EmptyState
          title="Permissao de Camera"
          message="Precisamos da camera para escanear o QR Code do convite."
          icon="camera-outline"
          action={{
            label: 'Permitir Acesso',
            onPress: requestPermission,
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={isPaused || showConfirm ? undefined : handleBarcodeScanned}
      />

      {/* Header overlay */}
      <View
        className="absolute left-0 right-0 top-0 flex-row items-center px-4 pb-3"
        style={{ paddingTop: androidPadding + 12 }}
      >
        <TouchableOpacity
          onPress={handleBack}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-white">
          Escanear Convite
        </Text>
      </View>

      {/* Scanner overlay */}
      <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
        <View className="h-64 w-64 rounded-2xl border-2 border-white/50">
          <View className="absolute -left-0.5 -top-0.5 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-primary-500" />
          <View className="absolute -right-0.5 -top-0.5 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-primary-500" />
          <View className="absolute -bottom-0.5 -left-0.5 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-primary-500" />
          <View className="absolute -bottom-0.5 -right-0.5 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-primary-500" />
        </View>
      </View>

      {/* Instruction */}
      <View className="absolute bottom-32 left-0 right-0 items-center">
        <View className="rounded-full bg-black/50 px-5 py-2.5">
          <Text className="text-sm font-medium text-white">
            Aponte para o QR Code do convite
          </Text>
        </View>
      </View>

      {/* Confirm bottom sheet */}
      {showConfirm ? (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-background-0 px-6 pb-10 pt-4">
          <View className="mb-4 self-center h-1 w-10 rounded-full bg-outline-200" />

          {loadingInvite ? (
            <View className="items-center py-8">
              <LoadingSpinner size="large" />
              <Text className="mt-3 text-sm text-typography-500">
                Verificando convite...
              </Text>
            </View>
          ) : invite ? (
            <View>
              <View className="mb-4 flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                  <Ionicons name="list" size={22} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-typography-900">
                    {invite.listName}
                  </Text>
                  <Text className="mt-0.5 text-xs text-typography-500">
                    Convite de {invite.invitedBy}
                  </Text>
                </View>
              </View>

              <View className="mb-4 flex-row gap-3">
                <View className="flex-1 items-center rounded-xl bg-background-50 py-3">
                  <Ionicons name="create-outline" size={16} color={colors.success} />
                  <Text className="mt-1 text-xs font-semibold text-typography-700">
                    {invite.role === 'editor' ? 'Editor' : 'Leitor'}
                  </Text>
                  <Text className="text-xs text-typography-400">Permissao</Text>
                </View>
                <View className="flex-1 items-center rounded-xl bg-background-50 py-3">
                  <Ionicons name="people-outline" size={16} color={colors.info} />
                  <Text className="mt-1 text-xs font-semibold text-typography-700">
                    Colaborativa
                  </Text>
                  <Text className="text-xs text-typography-400">Lista</Text>
                </View>
              </View>

              <Text className="mb-4 text-center text-xs text-typography-400">
                Ao entrar, ambos poderao adicionar e editar itens simultaneamente.
              </Text>

              <TouchableOpacity
                onPress={handleJoin}
                disabled={joinByInvite.isPending}
                className={`mb-3 flex-row items-center justify-center gap-2 rounded-full py-4 ${
                  joinByInvite.isPending ? 'bg-primary-300' : 'bg-primary-500'
                }`}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Entrar na lista"
              >
                <Ionicons name="log-in-outline" size={20} color={colors.white} />
                <Text className="text-sm font-bold text-white">
                  {joinByInvite.isPending ? 'Entrando...' : 'Entrar na Lista'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancel}
                className="flex-row items-center justify-center gap-2 rounded-full border border-outline-200 py-3.5"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-typography-700">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center py-6">
              <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
              <Text className="mt-2 text-sm font-bold text-typography-900">
                Convite Invalido
              </Text>
              <Text className="mt-1 text-xs text-typography-500">
                Este convite nao existe ou ja expirou.
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                className="mt-4 rounded-full bg-primary-500 px-6 py-3"
                activeOpacity={0.8}
              >
                <Text className="text-sm font-bold text-white">Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}
