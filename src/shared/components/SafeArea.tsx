import React from 'react';
import { Platform, StatusBar, View } from 'react-native';

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom')[];
}

export function SafeArea({ children, className = '', edges = ['top'] }: SafeAreaProps) {
  const paddingTop = edges.includes('top') && Platform.OS === 'android'
    ? StatusBar.currentHeight ?? 0
    : 0;

  return (
    <View className={`flex-1 ${className}`} style={{ paddingTop }}>
      {children}
    </View>
  );
}
