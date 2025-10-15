// Secure Firebase Configuration Loader
// This file safely loads Firebase config from environment variables

class SecureConfig {
    constructor() {
        this.config = null;
        this.loadConfig();
    }

    loadConfig() {
        // For production, these should come from environment variables
        // For development, load from .env.local file
        this.config = {
            apiKey: this.getEnvVar('FIREBASE_API_KEY', 'REPLACE_WITH_YOUR_NEW_API_KEY'),
            authDomain: this.getEnvVar('FIREBASE_AUTH_DOMAIN', 'nan-diary-6cdba.firebaseapp.com'),
            projectId: this.getEnvVar('FIREBASE_PROJECT_ID', 'nan-diary-6cdba'),
            storageBucket: this.getEnvVar('FIREBASE_STORAGE_BUCKET', 'nan-diary-6cdba.firebasestorage.app'),
            messagingSenderId: this.getEnvVar('FIREBASE_MESSAGING_SENDER_ID', '709052515369'),
            appId: this.getEnvVar('FIREBASE_APP_ID', '1:709052515369:web:0457058cd8b7d22010c838'),
            measurementId: this.getEnvVar('FIREBASE_MEASUREMENT_ID', 'G-KJZR72YVR8')
        };

        // Validate that API key has been replaced
        if (this.config.apiKey === 'REPLACE_WITH_YOUR_NEW_API_KEY') {
            console.warn('⚠️ Firebase API key not configured! Please set up your environment variables.');
        }
    }

    getEnvVar(name, defaultValue) {
        // Try to get from process.env (Node.js) or window (browser with build tool)
        if (typeof process !== 'undefined' && process.env && process.env[name]) {
            return process.env[name];
        }
        
        // Fallback for browser environments
        if (typeof window !== 'undefined' && window.env && window.env[name]) {
            return window.env[name];
        }
        
        return defaultValue;
    }

    getFirebaseConfig() {
        return this.config;
    }

    // Security configurations
    getSecurityConfig() {
        return {
            enforceHTTPS: true,
            enableAuditLog: true,
            maxUploadSize: 5 * 1024 * 1024, // 5MB
            rateLimits: {
                projectsPerUser: 100,
                requestsPerMinute: 60
            }
        };
    }
}

// Export singleton instance
const secureConfig = new SecureConfig();
export const firebaseConfig = secureConfig.getFirebaseConfig();
export const securityConfig = secureConfig.getSecurityConfig();