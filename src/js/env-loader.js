// Environment variable loader for browser environments
// This loads environment variables from various sources

class EnvLoader {
    static getFirebaseConfig() {
        // Try to get API key from various sources
        const apiKey = this.getApiKey();
        
        return {
            apiKey: apiKey,
            authDomain: 'nan-diary-6cdba.firebaseapp.com',
            projectId: 'nan-diary-6cdba',
            storageBucket: 'nan-diary-6cdba.firebasestorage.app',
            messagingSenderId: '709052515369',
            appId: '1:709052515369:web:0457058cd8b7d22010c838',
            measurementId: 'G-KJZR72YVR8'
        };
    }
    
    static getApiKey() {
        // 1. Try process.env (Node.js/build time)
        if (typeof process !== 'undefined' && process.env && process.env.FIREBASE_API_KEY) {
            return process.env.FIREBASE_API_KEY;
        }
        
        // 2. Try window.ENV (injected at build time)
        if (typeof window !== 'undefined' && window.ENV && window.ENV.FIREBASE_API_KEY) {
            return window.ENV.FIREBASE_API_KEY;
        }
        
        // 3. Try localStorage (for local development)
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('FIREBASE_API_KEY');
            if (stored && stored !== 'null') {
                return stored;
            }
        }
        
        // 4. Fallback placeholder
        return 'SECURE_PLACEHOLDER_DO_NOT_COMMIT_REAL_KEY';
    }
    
    static isConfigured() {
        const apiKey = this.getApiKey();
        return apiKey && apiKey !== 'SECURE_PLACEHOLDER_DO_NOT_COMMIT_REAL_KEY';
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvLoader;
} else if (typeof window !== 'undefined') {
    window.EnvLoader = EnvLoader;
}