// Generated Gluestack UI v3 NativeWind component — see https://gluestack.io/ui/docs/components/text
import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  children?: React.ReactNode;
  className?: string;
}

export function Text({ children, className, ...props }: TextProps) {
  return (
    <RNText className={className} {...props}>
      {children}
    </RNText>
  );
}
