import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/globals.css'
import App from './App.tsx'
// @ts-ignore
import { initFirebase } from './platform/config.js'
import { initSentry } from './lib/sentry'

// Initialize Sentry for error tracking (before Firebase and React)
initSentry();

// Initialize Firebase before rendering the app
initFirebase();

// Initialize authService wrapper after Firebase is ready
(function () {
    function ensureFirebase() {
        if (!window.firebaseAuth) {
            throw new Error('Firebase not initialized. Call initFirebase() first.');
        }
    }

    async function signIn(useRedirect: boolean) {
        ensureFirebase();
        const provider = new window.GoogleAuthProvider();
        if (useRedirect) {
            return window.signInWithRedirect(window.firebaseAuth, provider);
        }
        return window.signInWithPopup(window.firebaseAuth, provider);
    }

    async function getRedirectResult() {
        ensureFirebase();
        return window.getRedirectResult(window.firebaseAuth);
    }

    function onAuthStateChanged(callback: (user: any) => void) {
        ensureFirebase();
        return window.onAuthStateChanged(window.firebaseAuth, callback);
    }

    function signOut() {
        ensureFirebase();
        return window.firebaseAuth.signOut();
    }

    // Expose on window for App.tsx
    window.authService = {
        signIn,
        getRedirectResult,
        onAuthStateChanged,
        signOut
    };
})();

import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
