import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { SocketProvider } from './SocketProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <KeyboardProvider>
      <QueryProvider>
        <SocketProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SocketProvider>
      </QueryProvider>
    </KeyboardProvider>
  );
}
