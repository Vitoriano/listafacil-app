import React from 'react';
import { View } from 'react-native';

export function ScannerOverlay() {
  return (
    <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
      <View
        className="h-64 w-64 rounded-2xl border-2 border-white/50"
        accessibilityLabel="Area de escaneamento"
        accessibilityHint="Centralize o codigo de barras dentro desta moldura"
      >
        {/* Corner accent — top-left */}
        <View className="absolute -left-0.5 -top-0.5 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-primary-500" />
        {/* Corner accent — top-right */}
        <View className="absolute -right-0.5 -top-0.5 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-primary-500" />
        {/* Corner accent — bottom-left */}
        <View className="absolute -bottom-0.5 -left-0.5 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-primary-500" />
        {/* Corner accent — bottom-right */}
        <View className="absolute -bottom-0.5 -right-0.5 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-primary-500" />
      </View>
    </View>
  );
}
