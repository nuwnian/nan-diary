const admin = require('firebase-admin');
const config = require('./index');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * Uses service account in development, Application Default Credentials in production
 */
function initializeFirebaseAdmin() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const firebaseConfig = {
      projectId: config.firebase.projectId,
    };

    // In development, use service account JSON file if provided
    if (config.nodeEnv === 'development' && config.firebase.serviceAccountPath) {
      const serviceAccount = require(config.firebase.serviceAccountPath);
      firebaseConfig.credential = admin.credential.cert(serviceAccount);
    } else {
      // In production (e.g., Cloud Run, App Engine), use Application Default Credentials
      firebaseConfig.credential = admin.credential.applicationDefault();
    }

    if (config.firebase.databaseURL) {
      firebaseConfig.databaseURL = config.firebase.databaseURL;
    }

    firebaseApp = admin.initializeApp(firebaseConfig);
    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    throw error;
  }
}

/**
 * Get Firestore instance
 */
function getFirestore() {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
}

/**
 * Get Auth instance
 */
function getAuth() {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
}

module.exports = {
  initializeFirebaseAdmin,
  getFirestore,
  getAuth,
  admin,
};
