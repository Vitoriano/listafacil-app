import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
}
