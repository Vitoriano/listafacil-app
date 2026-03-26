import React from 'react';
import { ActivityIndicator, View } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
}

export function LoadingSpinner({ size = 'large' }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size={size} color="#EA1D2C" />
    </View>
  );
}
