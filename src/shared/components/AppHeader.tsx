import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { HStack } from '../../../components/ui/hstack';
import { VStack } from '../../../components/ui/vstack';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

export function AppHeader({ title, subtitle, onBack }: AppHeaderProps) {
  return (
    <HStack className="bg-background-50 px-4 py-3">
      {onBack ? (
        <TouchableOpacity
          className="mr-3 p-1"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Text className="text-2xl text-primary-500">{'‹'}</Text>
        </TouchableOpacity>
      ) : null}
      <VStack className="flex-1">
        {title ? (
          <Text className="text-lg font-bold text-typography-900">{title}</Text>
        ) : null}
        {subtitle ? (
          <Text className="text-sm text-typography-500">{subtitle}</Text>
        ) : null}
      </VStack>
    </HStack>
  );
}
