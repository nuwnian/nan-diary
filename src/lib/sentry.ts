// Sentry configuration for error tracking and monitoring
import * as Sentry from '@sentry/react';

// Extend ImportMeta to include 'env' for Vite
interface ImportMetaEnv {
  VITE_SENTRY_DSN?: string;
  MODE?: string;
  [key: string]: any;
}

declare global {
  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

export function initSentry() {
  // Only initialize in production or when explicitly enabled
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || 'development';
  
  if (!sentryDsn) {
    console.warn('Sentry DSN not configured. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust this value in production for performance optimization
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Set sample rate for profiling
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Capture Replay for Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
    
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filter out specific errors
    beforeSend(event, hint) {
      // Filter out Firebase auth errors that are expected
      const error = hint.originalException;
      if (error instanceof Error) {
        if (error.message.includes('popup-closed-by-user')) {
          return null; // Don't send popup closed errors
        }
        if (error.message.includes('network-request-failed')) {
          // Log but don't spam Sentry with network errors
          console.warn('Network error:', error);
          return null;
        }
      }
      return event;
    },
    
    // Add custom tags
    initialScope: {
      tags: {
        'app.version': '1.0.0',
        'app.name': 'nan-diary',
      },
    },
  });
}

// Helper function to capture user context
export function setSentryUser(user: { uid: string; email?: string; displayName?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.uid,
      email: user.email,
      username: user.displayName || user.email,
    });
  } else {
    Sentry.setUser(null);
  }
}

// Helper function to create Jira issue from Sentry error
export function createJiraIssueFromError(
  error: Error,
  context?: Record<string, any>
) {
  Sentry.captureException(error, {
    tags: {
      'issue.type': 'bug',
      'needs.jira': 'true',
    },
    contexts: {
      jira: {
        ...context,
      },
    },
  });
}

// Helper to add breadcrumb
export function addBreadcrumb(message: string, category: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}
