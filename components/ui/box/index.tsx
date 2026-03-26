// Generated Gluestack UI v3 NativeWind component — see https://gluestack.io/ui/docs/components/box
import React from 'react';
import { View, type ViewProps } from 'react-native';

interface BoxProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
}

export function Box({ children, className, ...props }: BoxProps) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}
