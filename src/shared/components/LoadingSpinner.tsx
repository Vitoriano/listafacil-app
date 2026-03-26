import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
}

export function LoadingSpinner({ size = 'large' }: LoadingSpinnerProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}
