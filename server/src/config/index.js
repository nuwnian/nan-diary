require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Firebase Admin SDK configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'nan-diary-6cdba',
    // Service account JSON path (for local dev) or use Application Default Credentials in production
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || null,
    databaseURL: process.env.FIREBASE_DATABASE_URL || null,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : 'http://localhost:3000',
    credentials: true,
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },
  
  // Security settings
  security: {
    maxProjectsPerUser: 100,
    maxProjectTitleLength: 200,
    maxProjectNotesLength: 50000,
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      maxSize: '20m',
      maxFiles: '14d',
    },
  },
};

module.exports = config;
