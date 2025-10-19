const { getAuth } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Authentication middleware - verifies Firebase ID token
 * Attaches decoded user info to req.user
 */
async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header. Expected format: Bearer <token>',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    // Verify the ID token with Firebase Admin SDK
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    logger.info('User authenticated', { userId: req.user.uid, email: req.user.email });
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'TokenExpired',
        message: 'Your session has expired. Please sign in again.',
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        error: 'TokenRevoked',
        message: 'Your session has been revoked. Please sign in again.',
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without authentication
    return next();
  }

  // Token provided, attempt to authenticate
  return authenticate(req, res, next);
}

module.exports = {
  authenticate,
  optionalAuth,
};
