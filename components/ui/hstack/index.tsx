// Generated Gluestack UI v3 NativeWind component — see https://gluestack.io/ui/docs/components/hstack
import React from 'react';
import { View, type ViewProps } from 'react-native';

interface HStackProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const spaceClasses: Record<NonNullable<HStackProps['space']>, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export function HStack({ children, className, space, ...props }: HStackProps) {
  const spaceClass = space ? spaceClasses[space] : '';
  const combinedClass = ['flex-row items-center', spaceClass, className].filter(Boolean).join(' ');
  return (
    <View className={combinedClass} {...props}>
      {children}
    </View>
  );
}
