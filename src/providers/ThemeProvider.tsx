import React from 'react';
import { GluestackUIProvider } from '../../components/ui/gluestack-ui-provider';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <GluestackUIProvider mode="light">{children}</GluestackUIProvider>;
}
