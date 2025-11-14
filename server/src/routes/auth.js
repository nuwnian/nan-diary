const express = require('express');
const { body } = require('express-validator');
const AuthService = require('../services/authService');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * POST /api/auth/verify
 * Verify a Firebase ID token
 * Public endpoint - doesn't require authentication
 */
router.post(
  '/verify',
  [
    body('idToken').notEmpty().withMessage('ID token is required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    
    const result = await AuthService.verifyToken(idToken);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: 'InvalidToken',
        message: 'Token verification failed',
      });
    }
    
    res.json({
      success: true,
      user: result.user,
    });
  })
);

/**
 * GET /api/auth/me
 * Get current user information
 * Requires authentication
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await AuthService.getUserInfo(req.user.uid);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'UserNotFound',
        message: 'User information not found',
      });
    }
    
    res.json({
      success: true,
      user: result.user,
    });
  })
);

/**
 * POST /api/auth/revoke
 * Revoke user's refresh tokens (force sign out everywhere)
 * Requires authentication
 */
router.post(
  '/revoke',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await AuthService.revokeUserTokens(req.user.uid);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'RevokeFailed',
        message: 'Failed to revoke tokens',
      });
    }
    
    res.json({
      success: true,
      message: 'All sessions revoked successfully',
    });
  })
);

module.exports = router;
