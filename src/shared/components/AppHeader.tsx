import React from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function AppHeader({ title, subtitle, onBack, rightAction }: AppHeaderProps) {
  const colors = useThemeColors();
  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <View
      className="bg-background-0"
      style={{ paddingTop: androidPadding }}
    >
      <View className="flex-row items-center px-5 py-3.5">
        {onBack ? (
          <TouchableOpacity
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-background-50"
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={colors.icon} />
          </TouchableOpacity>
        ) : null}
        <View className="flex-1">
          {title ? (
            <Text className="text-lg font-bold text-typography-900">{title}</Text>
          ) : null}
          {subtitle ? (
            <Text className="mt-0.5 text-xs text-typography-500">{subtitle}</Text>
          ) : null}
        </View>
        {rightAction ?? null}
      </View>
    </View>
  );
}
