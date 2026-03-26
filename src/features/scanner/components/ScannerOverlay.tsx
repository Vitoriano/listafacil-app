import React from 'react';
import { View } from 'react-native';

export function ScannerOverlay() {
  return (
    <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
      {/* Dark semi-transparent background with a "hole" effect via border */}
      <View
        className="h-64 w-64 rounded-xl border-2 border-white"
        accessibilityLabel="Scan area"
        accessibilityHint="Center the barcode within this frame to scan"
      >
        {/* Corner accent — top-left */}
        <View className="absolute -left-0.5 -top-0.5 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-primary-500" />
        {/* Corner accent — top-right */}
        <View className="absolute -right-0.5 -top-0.5 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-primary-500" />
        {/* Corner accent — bottom-left */}
        <View className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-primary-500" />
        {/* Corner accent — bottom-right */}
        <View className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-primary-500" />
      </View>
    </View>
  );
}
