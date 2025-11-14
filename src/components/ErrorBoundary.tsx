// Error boundary component for React
import React from 'react';
import * as Sentry from '@sentry/react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3] p-4">
          <div className="neuro-card max-w-md w-full p-8 text-center rounded-3xl">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-[#333] mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-[#666] mb-6">
              We're sorry for the inconvenience. Our team has been notified and
              is working on a fix.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="neuro-button w-full px-6 py-3 rounded-xl text-[#333] font-semibold border border-[#8EB69B] hover:bg-[#f5f5f5]"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="neuro-button w-full px-6 py-3 rounded-xl text-[#333] font-semibold border border-[#8EB69B] hover:bg-[#f5f5f5]"
              >
                Go to Home
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-[#666] hover:text-[#333]">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-[#666] bg-[#f5f5f5] p-3 rounded-lg overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
