import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { VStack } from '../../../components/ui/vstack';
import { logger } from '@/shared/utils/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error('ErrorBoundary', `Caught render error: ${error.message}`, {
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <VStack className="flex-1 items-center justify-center px-8 py-12">
          <Text className="mb-2 text-xl font-bold text-typography-900">
            Algo deu errado
          </Text>
          <Text className="mb-6 text-center text-base text-typography-500">
            {this.state.error?.message ?? 'Ocorreu um erro inesperado.'}
          </Text>
          <TouchableOpacity
            className="rounded-lg bg-primary-500 px-6 py-3"
            onPress={this.handleReset}
            accessibilityRole="button"
          >
            <Text className="text-base font-semibold text-white">Tentar novamente</Text>
          </TouchableOpacity>
        </VStack>
      );
    }

    return this.props.children;
  }
}
