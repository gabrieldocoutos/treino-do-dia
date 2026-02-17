import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { Button, H2, Text, YStack } from 'tamagui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
          <H2>Algo deu errado</H2>
          <Text color="$gray10" textAlign="center">
            {this.state.error?.message ?? 'Ocorreu um erro inesperado.'}
          </Text>
          <Button themeInverse onPress={this.handleReset}>
            Tentar novamente
          </Button>
        </YStack>
      );
    }

    return this.props.children;
  }
}
