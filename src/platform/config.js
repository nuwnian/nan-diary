// Platform boundary for Firebase initialization.
// This module centralizes Firebase initialization so other code can import it
// or the HTML can call `initFirebase()` to set up globals for backward compatibility.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, FacebookAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

export function initFirebase() {
    // Ensure window.ENV exists
    window.ENV = window.ENV || {};
    
    // Get API key from multiple sources (in order of priority):
    // 1. Vite build-time injection via import.meta.env (primary source)
    // 2. Already set in window.ENV (e.g., from env-loader.js)
    // 3. Fallback API key for development
    let apiKey = null;
    
    // Try to get from Vite environment first (most reliable)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) {
        apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    }
    
    // Fallback to window.ENV if Vite env not available
    if (!apiKey && window.ENV && window.ENV.FIREBASE_API_KEY) {
        apiKey = window.ENV.FIREBASE_API_KEY;
    }
    
    // Final fallback - require environment variable
    if (!apiKey || apiKey === "PLACEHOLDER_FOR_BUILD_INJECTION") {
        throw new Error('Firebase API key not found. Please set VITE_FIREBASE_API_KEY in your .env.local file.');
    }
    
    window.ENV.FIREBASE_API_KEY = apiKey;

    const firebaseConfig = {
        "apiKey": apiKey,
        "authDomain": "nan-diary-6cdba.firebaseapp.com",
        "projectId": "nan-diary-6cdba",
        "storageBucket": "nan-diary-6cdba.firebasestorage.app",
        "messagingSenderId": "709052515369",
        "appId": "1:709052515369:web:0457058cd8b7d22010c838",
        "measurementId": "G-KJZR72YVR8"
    };

    // Initialize Firebase and expose commonly-used APIs on window for backward compatibility
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const analytics = getAnalytics(app);

    window.firebaseAuth = auth;
    window.firebaseDb = db;
    window.GoogleAuthProvider = GoogleAuthProvider;
    window.FacebookAuthProvider = FacebookAuthProvider;
    window.signInWithPopup = signInWithPopup;
    window.signInWithRedirect = signInWithRedirect;
    window.getRedirectResult = getRedirectResult;
    window.onAuthStateChanged = onAuthStateChanged;
    window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
    window.signInWithEmailAndPassword = signInWithEmailAndPassword;
    window.doc = doc;
    window.setDoc = setDoc;
    window.getDoc = getDoc;
    window.collection = collection;

    return { app, auth, db, analytics };
}

// When imported in non-HTML contexts, don't automatically init. Call initFirebase() explicitly.
