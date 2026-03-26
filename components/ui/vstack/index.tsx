// Generated Gluestack UI v3 NativeWind component — see https://gluestack.io/ui/docs/components/vstack
import React from 'react';
import { View, type ViewProps } from 'react-native';

interface VStackProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const spaceClasses: Record<NonNullable<VStackProps['space']>, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export function VStack({ children, className, space, ...props }: VStackProps) {
  const spaceClass = space ? spaceClasses[space] : '';
  const combinedClass = ['flex-col', spaceClass, className].filter(Boolean).join(' ');
  return (
    <View className={combinedClass} {...props}>
      {children}
    </View>
  );
}
