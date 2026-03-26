import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export function EmptyState({ message, title, icon = 'file-tray-outline', action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-background-100">
        <Ionicons name={icon} size={28} color="#7D7D7D" />
      </View>
      {title ? (
        <Text className="mb-1 text-lg font-bold text-typography-900">{title}</Text>
      ) : null}
      <Text className="text-center text-sm leading-5 text-typography-500">{message}</Text>
      {action ? (
        <TouchableOpacity
          className="mt-6 rounded-full bg-primary-500 px-8 py-3"
          onPress={action.onPress}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text className="text-sm font-bold text-white">{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
