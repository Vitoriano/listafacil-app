import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface ProductNotFoundSheetProps {
  visible: boolean;
  barcode: string | null;
  onManualEntry: () => void;
  onDismiss: () => void;
  /** Fecha sozinho depois deste tempo (ms). 0 desativa. */
  autoHideMs?: number;
}

/**
 * Aviso de "produto não encontrado" sobre a câmera. Não bloqueia a leitura:
 * a câmera continua ativa e basta apontar para outro código. Cores explícitas
 * (sem depender de classes) para garantir contraste sobre o preview da câmera.
 */
export function ProductNotFoundSheet({
  visible,
  barcode,
  onManualEntry,
  onDismiss,
  autoHideMs = 6000,
}: ProductNotFoundSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible || !autoHideMs) return;
    const timer = setTimeout(onDismiss, autoHideMs);
    return () => clearTimeout(timer);
  }, [visible, autoHideMs, barcode, onDismiss]);

  if (!visible) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 16) + 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <View
        style={{
          alignSelf: 'center',
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.borderSecondary,
          marginBottom: 14,
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.warningLight,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="search-outline" size={24} color={colors.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
            Produto não encontrado
          </Text>
          <Text style={{ marginTop: 2, fontSize: 13, color: colors.textSecondary }}>
            Código{' '}
            <Text style={{ fontFamily: 'monospace', fontWeight: '600', color: colors.text }}>
              {barcode}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.backgroundSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginTop: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRadius: 12,
          backgroundColor: colors.backgroundSecondary,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Ionicons name="scan-outline" size={16} color={colors.success} />
        <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary }}>
          A câmera continua ativa: aponte para outro código para tentar de novo.
        </Text>
      </View>

      <TouchableOpacity
        onPress={onManualEntry}
        accessibilityRole="button"
        accessibilityLabel="Digitar código de barras"
        activeOpacity={0.8}
        style={{
          marginTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 999,
          backgroundColor: colors.primary,
          paddingVertical: 14,
        }}
      >
        <Ionicons name="keypad-outline" size={18} color={colors.white} />
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>Digitar Codigo</Text>
      </TouchableOpacity>
    </View>
  );
}
