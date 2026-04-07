import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppHeader } from '@/shared/components/AppHeader';
import { TERMS_OF_USE, PRIVACY_POLICY } from '@/shared/content/legal';

type LegalType = 'terms' | 'privacy';

const TITLES: Record<LegalType, string> = {
  terms: 'Termos de Uso',
  privacy: 'Política de Privacidade',
};

const CONTENT: Record<LegalType, string> = {
  terms: TERMS_OF_USE,
  privacy: PRIVACY_POLICY,
};

export function LegalScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();

  const legalType: LegalType = type === 'privacy' ? 'privacy' : 'terms';
  const title = TITLES[legalType];
  const content = CONTENT[legalType];

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title={title} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-2xl bg-background-0 p-5">
          {content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            const isTitle = index === 0;
            const isHeading = /^\d+\.\s[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(trimmed);
            const isSubItem = /^\d+\.\d+\./.test(trimmed);

            if (isTitle) {
              return (
                <Text
                  key={index}
                  className="mb-4 text-lg font-bold text-typography-900"
                >
                  {trimmed}
                </Text>
              );
            }

            if (isHeading) {
              return (
                <Text
                  key={index}
                  className="mb-2 mt-5 text-sm font-bold text-typography-900"
                >
                  {trimmed}
                </Text>
              );
            }

            return (
              <Text
                key={index}
                className={`mb-3 text-sm leading-6 text-typography-600 ${isSubItem ? 'ml-2' : ''}`}
              >
                {trimmed}
              </Text>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
