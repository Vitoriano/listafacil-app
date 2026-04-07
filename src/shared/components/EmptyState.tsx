import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useAnimatedEntry } from '@/shared/hooks/useAnimatedEntry';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  message: string;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: EmptyStateAction;
}

const ILLUSTRATION_MAP: Partial<Record<string, { bg: string; accent: string; secondaryIcon: keyof typeof Ionicons.glyphMap }>> = {
  'list-outline': { bg: '#EEF2FF', accent: '#6366F1', secondaryIcon: 'add-circle-outline' },
  'cart-outline': { bg: '#FFF1F1', accent: '#EA1D2C', secondaryIcon: 'bag-add-outline' },
  'search-outline': { bg: '#F0F9FF', accent: '#0EA5E9', secondaryIcon: 'scan-outline' },
  'flash-outline': { bg: '#FFFBEB', accent: '#D97706', secondaryIcon: 'bulb-outline' },
  'camera-outline': { bg: '#F0FDF4', accent: '#16A34A', secondaryIcon: 'qr-code-outline' },
  'alert-circle-outline': { bg: '#FEF2F2', accent: '#DC2626', secondaryIcon: 'warning-outline' },
  'bag-outline': { bg: '#FDF4FF', accent: '#A855F7', secondaryIcon: 'receipt-outline' },
  'pricetag-outline': { bg: '#F0FDFA', accent: '#14B8A6', secondaryIcon: 'cash-outline' },
  'time-outline': { bg: '#FFF7ED', accent: '#F97316', secondaryIcon: 'bar-chart-outline' },
  'trending-up': { bg: '#ECFDF5', accent: '#05966A', secondaryIcon: 'wallet-outline' },
  'file-tray-outline': { bg: '#F5F5F5', accent: '#737373', secondaryIcon: 'document-outline' },
};

export function EmptyState({ message, title, icon = 'file-tray-outline', action }: EmptyStateProps) {
  const colors = useThemeColors();
  const illustration = ILLUSTRATION_MAP[icon] ?? ILLUSTRATION_MAP['file-tray-outline']!;

  const iconStyle = useAnimatedEntry({ delay: 0, translateY: 30 });
  const textStyle = useAnimatedEntry({ delay: 150, translateY: 20 });
  const actionStyle = useAnimatedEntry({ delay: 300, translateY: 15 });

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      {/* Illustrated icon area */}
      <Animated.View style={iconStyle}>
        <View
          style={{ backgroundColor: illustration.bg }}
          className="mb-6 h-28 w-28 items-center justify-center rounded-full"
        >
          {/* Decorative ring */}
          <View
            style={{ borderColor: illustration.accent, opacity: 0.15 }}
            className="absolute h-36 w-36 rounded-full border-2"
          />
          {/* Main icon */}
          <Ionicons name={icon} size={44} color={illustration.accent} />
          {/* Secondary floating icon */}
          <View
            style={{ backgroundColor: illustration.accent }}
            className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full shadow-sm"
          >
            <Ionicons name={illustration.secondaryIcon} size={18} color="#FFFFFF" />
          </View>
        </View>
      </Animated.View>

      {/* Text content */}
      <Animated.View style={textStyle} className="items-center">
        {title ? (
          <Text className="mb-2 text-xl font-bold text-typography-900">{title}</Text>
        ) : null}
        <Text className="text-center text-sm leading-6 text-typography-400" style={{ maxWidth: 260 }}>
          {message}
        </Text>
      </Animated.View>

      {/* Action button */}
      {action ? (
        <Animated.View style={actionStyle}>
          <TouchableOpacity
            className="mt-8 flex-row items-center gap-2 rounded-full bg-primary-500 px-8 py-3.5 shadow-sm"
            onPress={action.onPress}
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">{action.label}</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </View>
  );
}
