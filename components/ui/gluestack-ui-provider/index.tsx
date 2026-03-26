import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useColorScheme, colorScheme as colorSchemeNW } from 'nativewind';
import { config } from './config';

type ModeType = 'light' | 'dark' | 'system';
type ResolvedColorScheme = 'light' | 'dark';

function getColorSchemeName(
  colorScheme: ResolvedColorScheme | undefined,
  mode: ModeType,
): ResolvedColorScheme {
  if (mode === 'system') {
    return colorScheme ?? 'light';
  }
  return mode;
}

interface GluestackUIProviderProps {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}

export function GluestackUIProvider({
  mode = 'system',
  ...props
}: GluestackUIProviderProps) {
  const { colorScheme } = useColorScheme();

  const colorSchemeName = getColorSchemeName(colorScheme, mode);

  colorSchemeNW.set(mode);

  return (
    <View style={[config[colorSchemeName], { flex: 1 }, props.style]}>
      {props.children}
    </View>
  );
}
