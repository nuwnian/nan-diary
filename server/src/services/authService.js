const { getAuth } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Authentication Service
 * Handles user authentication and authorization logic
 */
class AuthService {
  /**
   * Verify Firebase ID token
   */
  static async verifyToken(idToken) {
    try {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(idToken);
      
      return {
        success: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name,
          picture: decodedToken.picture,
        },
      };
    } catch (error) {
      logger.error('Token verification failed', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user information by UID
   */
  static async getUserInfo(uid) {
    try {
      const auth = getAuth();
      const userRecord = await auth.getUser(uid);
      
      return {
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          disabled: userRecord.disabled,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
          },
        },
      };
    } catch (error) {
      logger.error('Failed to get user info', { uid, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Revoke user's refresh tokens (force sign out)
   */
  static async revokeUserTokens(uid) {
    try {
      const auth = getAuth();
      await auth.revokeRefreshTokens(uid);
      
      logger.info('User tokens revoked', { uid });
      return { success: true };
    } catch (error) {
      logger.error('Failed to revoke tokens', { uid, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a user account
   */
  static async deleteUser(uid) {
    try {
      const auth = getAuth();
      await auth.deleteUser(uid);
      
      logger.info('User deleted', { uid });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete user', { uid, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = AuthService;
