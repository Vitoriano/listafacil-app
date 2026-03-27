import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { SocketProvider } from './SocketProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <SocketProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </SocketProvider>
    </QueryProvider>
  );
}
