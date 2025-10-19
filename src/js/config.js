// Secure Firebase configuration using environment variables
// Note: API keys for Firebase web clients are safe to expose publicly
// The security comes from Firestore security rules and Firebase Auth
const firebaseConfig = {
    // For security, prefer loading from environment variable. If not set, fallback to hardcoded key (not recommended for production)
    'apiKey': process.env.FIREBASE_API_KEY || 'YOUR_API_KEY_HERE',
    'authDomain': 'nan-diary-6cdba.firebaseapp.com',
    'projectId': 'nan-diary-6cdba',
    'storageBucket': 'nan-diary-6cdba.firebasestorage.app',
    'messagingSenderId': '709052515369',
    'appId': '1:709052515369:web:0457058cd8b7d22010c838',
    'measurementId': 'G-KJZR72YVR8'
};

// Additional security configurations
const securityConfig = {
    // Enforce HTTPS in production
    enforceHTTPS: true,
    // Enable audit logging
    enableAuditLog: true,
    // Maximum file size for uploads (if implemented later)
    maxUploadSize: 5 * 1024 * 1024, // 5MB
    // Rate limiting settings
    rateLimits: {
        projectsPerUser: 100,
        requestsPerMinute: 60
    }
};

export { firebaseConfig, securityConfig };
//
// SECURITY NOTE:
// To avoid public exposure of your API key, create a .env file in your project root with:
// FIREBASE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
// Then use a bundler or environment loader to inject process.env.FIREBASE_API_KEY at build time.