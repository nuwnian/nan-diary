const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware to handle validation errors from express-validator
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', { errors: errors.array(), path: req.path });
    
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Invalid request data',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
}

module.exports = {
  handleValidationErrors,
};
