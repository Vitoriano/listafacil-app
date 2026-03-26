// Generated Gluestack UI v3 NativeWind component — see https://gluestack.io/ui/docs/components/pressable
import React from 'react';
import { Pressable as RNPressable, type PressableProps } from 'react-native';

interface PressableComponentProps extends PressableProps {
  children?: React.ReactNode;
  className?: string;
}

export function Pressable({ children, className, ...props }: PressableComponentProps) {
  return (
    <RNPressable className={className} {...props}>
      {children}
    </RNPressable>
  );
}
