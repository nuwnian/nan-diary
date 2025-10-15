// Secure Firebase configuration
// Note: API keys for Firebase web clients are safe to expose publicly
// The security comes from Firestore security rules and Firebase Auth
const firebaseConfig = {
    "apiKey": "PLACEHOLDER_WILL_BE_REPLACED_IN_BUILD",
    "authDomain": "nan-diary-6cdba.firebaseapp.com",
    "projectId": "nan-diary-6cdba",
    "storageBucket": "nan-diary-6cdba.firebasestorage.app",
    "messagingSenderId": "709052515369",
    "appId": "1:709052515369:web:0457058cd8b7d22010c838",
    "measurementId": "G-KJZR72YVR8"
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