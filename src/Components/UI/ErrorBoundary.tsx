import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorScreen from './ErrorScreen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen 
          message={this.state.error?.message || "Something went wrong. Please try again later."} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;