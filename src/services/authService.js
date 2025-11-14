// Lightweight auth service wrapper. Attaches to window.authService for non-module compatibility.
(function () {
    function ensureFirebase() {
        if (!window.firebaseAuth) {
            throw new Error('Firebase not initialized. Call initFirebase() first.');
        }
    }

    async function signIn(useRedirect) {
        ensureFirebase();
        const provider = new window.GoogleAuthProvider();
        if (useRedirect) {
            // Redirect does not return a result in the same page
            return window.signInWithRedirect(window.firebaseAuth, provider);
        }
        return window.signInWithPopup(window.firebaseAuth, provider);
    }

    async function getRedirectResult() {
        ensureFirebase();
        return window.getRedirectResult(window.firebaseAuth);
    }

    function onAuthStateChanged(callback) {
        ensureFirebase();
        return window.onAuthStateChanged(window.firebaseAuth, callback);
    }

    function signOut() {
        ensureFirebase();
        return window.firebaseAuth.signOut();
    }

    // Expose on window for backward-compatible usage from non-module scripts
    window.authService = {
        signIn,
        getRedirectResult,
        onAuthStateChanged,
        signOut
    };
})();
