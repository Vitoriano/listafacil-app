// Generated Gluestack UI v3 NativeWind component — see https://gluestack.io/ui/docs/components/spinner
import React from 'react';
import { ActivityIndicator } from 'react-native';

interface SpinnerProps {
  size?: 'small' | 'large';
  className?: string;
}

export function Spinner({ size = 'large', className }: SpinnerProps) {
  return <ActivityIndicator size={size} className={className} />;
}
