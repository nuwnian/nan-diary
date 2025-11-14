# Nan Diary API Server

Backend REST API for Nan Diary with Firebase Admin SDK integration.

## 🏗️ Architecture

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.js     # Main config
│   │   └── firebase.js  # Firebase Admin SDK setup
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # JWT authentication
│   │   ├── validation.js # Request validation
│   │   ├── errorHandler.js # Error handling
│   │   └── requestLogger.js # Request logging
│   ├── routes/          # API route handlers
│   │   ├── auth.js      # Authentication endpoints
│   │   └── projects.js  # Projects CRUD endpoints
│   ├── services/        # Business logic layer
│   │   ├── authService.js    # Auth business logic
│   │   └── projectsService.js # Projects business logic
│   ├── utils/           # Utility functions
│   │   ├── logger.js    # Winston logger
│   │   └── security.js  # Security utilities
│   └── index.js         # Express app entry point
├── tests/               # API tests
├── logs/                # Log files (gitignored)
├── .env                 # Environment variables (gitignored)
├── .env.example         # Environment template
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Download Firebase service account JSON
# 1. Go to Firebase Console > Project Settings > Service Accounts
# 2. Click "Generate New Private Key"
# 3. Save as firebase-service-account.json in server/ directory

# Edit .env with your configuration
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check

```
GET /health
```

Returns server health status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### Authentication

#### Verify Token

```
POST /api/auth/verify
```

Verify a Firebase ID token.

**Request Body:**
```json
{
  "idToken": "your-firebase-id-token"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user-123",
    "email": "user@example.com",
    "emailVerified": true,
    "name": "User Name",
    "picture": "https://..."
  }
}
```

#### Get Current User

```
GET /api/auth/me
```

Get information about the authenticated user.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user-123",
    "email": "user@example.com",
    "emailVerified": true,
    "displayName": "User Name",
    "photoURL": "https://...",
    "metadata": {
      "creationTime": "2024-01-01",
      "lastSignInTime": "2024-01-02"
    }
  }
}
```

#### Revoke Tokens

```
POST /api/auth/revoke
```

Revoke all refresh tokens for the authenticated user (force sign out everywhere).

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response:**
```json
{
  "success": true,
  "message": "All sessions revoked successfully"
}
```

### Projects

All project endpoints require authentication via `Authorization: Bearer <token>` header.

#### Get All Projects

```
GET /api/projects
```

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "title": "Spring Collection",
      "emoji": "🌸",
      "date": "October 10, 2025",
      "notes": "Project notes..."
    }
  ],
  "count": 1
}
```

#### Save Projects

```
POST /api/projects
```

Save all projects (replaces existing).

**Request Body:**
```json
{
  "projects": [
    {
      "title": "New Project",
      "emoji": "🌸",
      "date": "October 10, 2025",
      "notes": "Project notes..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "projects": [...],
  "message": "Projects saved successfully"
}
```

#### Add New Project

```
POST /api/projects/add
```

**Request Body:**
```json
{
  "title": "New Project",
  "emoji": "🌸",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "title": "New Project",
    "emoji": "🌸",
    "date": "October 19, 2025",
    "notes": "Optional notes"
  },
  "message": "Project created successfully"
}
```

#### Update Project

```
PUT /api/projects/:index
```

**Parameters:**
- `index` - Project index (0-based)

**Request Body:**
```json
{
  "title": "Updated Title",
  "emoji": "🌺",
  "date": "October 19, 2025",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "project": {...},
  "message": "Project updated successfully"
}
```

#### Delete Project

```
DELETE /api/projects/:index
```

**Parameters:**
- `index` - Project index (0-based)

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

## 🔒 Security Features

- **Firebase Admin SDK** - Server-side token verification
- **Helmet** - Security headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Input Validation** - Express-validator for all inputs
- **XSS Protection** - HTML sanitization for user content
- **Request Size Limits** - 10MB max payload
- **Comprehensive Logging** - Winston with file rotation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment (development/production) | development |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | info |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Required |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to service account JSON | null |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3000 |

## 🚢 Deployment

### Cloud Run / App Engine

Uses Application Default Credentials - no service account file needed.

```bash
# Build Docker image
docker build -t nan-diary-api .

# Deploy to Cloud Run
gcloud run deploy nan-diary-api \
  --image nan-diary-api \
  --platform managed \
  --allow-unauthenticated
```

### Other Platforms

Ensure you set `FIREBASE_SERVICE_ACCOUNT_PATH` or provide credentials via environment.

## 📊 Logging

Logs are written to:
- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs/combined-YYYY-MM-DD.log` - All logs
- Console (development only)

Logs rotate daily and are kept for 14 days.

## 🔧 Development Scripts

```bash
npm start          # Start production server
npm run dev        # Start with nodemon (auto-reload)
npm test           # Run tests
npm run lint       # Check code style
npm run lint:fix   # Fix code style issues
```

## 🐛 Troubleshooting

### Firebase Admin SDK Issues

**Error: "Could not load the default credentials"**

Solution: Provide service account JSON path in `.env`:
```
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### CORS Issues

**Error: "Access-Control-Allow-Origin"**

Solution: Add your frontend URL to `CORS_ORIGIN` in `.env`:
```
CORS_ORIGIN=http://localhost:3000,https://your-domain.com
```

### Rate Limit Exceeded

If you hit rate limits during development, you can adjust in `src/config/index.js`:
```javascript
rateLimit: {
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increase for development
}
```

## 📚 Further Reading

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Winston Logger](https://github.com/winstonjs/winston)
