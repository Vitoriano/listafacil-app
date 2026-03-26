import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { VStack } from '../../../components/ui/vstack';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  message: string;
  title?: string;
  action?: EmptyStateAction;
}

export function EmptyState({ message, title, action }: EmptyStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center px-8 py-12">
      {title ? (
        <Text className="mb-2 text-xl font-bold text-typography-900">{title}</Text>
      ) : null}
      <Text className="text-center text-base text-typography-500">{message}</Text>
      {action ? (
        <TouchableOpacity
          className="mt-6 rounded-lg bg-primary-500 px-6 py-3"
          onPress={action.onPress}
          accessibilityRole="button"
        >
          <Text className="text-base font-semibold text-white">{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </VStack>
  );
}
