import { Component } from './Component';
import { VNode } from './VNode';

export interface ErrorInfo {
  componentStack: string;
  error: Error;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export abstract class ErrorBoundary extends Component<any, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined
    };
  }

  /**
   * Called when an error occurs in a child component
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Lifecycle method to catch errors in children
   */
  protected componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;

  /**
   * Must be implemented to render fallback UI when error occurs
   */
  protected abstract fallbackRender(error: Error): VNode;

  render(): VNode {
    if (this.state.hasError) {
      return this.fallbackRender(this.state.error!);
    }

    return this.props.children;
  }
} 