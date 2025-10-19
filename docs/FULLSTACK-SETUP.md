# 🚀 Full-Stack Setup Guide

This guide will help you set up the complete full-stack Nan Diary application with backend API server and frontend client.

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Firebase project with Firestore enabled
- Firebase service account JSON (for backend)

## 🏗️ Architecture Overview

```
Nan Diary Full-Stack
├── Frontend (Client)
│   ├── HTML/CSS/Vanilla JS
│   ├── Firebase Web SDK (Auth only)
│   └── API Client (communicates with backend)
│
└── Backend (Server)
    ├── Node.js + Express
    ├── Firebase Admin SDK
    ├── REST API endpoints
    └── Business logic & validation
```

**Benefits:**
- ✅ Server-side validation and security
- ✅ Centralized business logic
- ✅ Better scalability
- ✅ Separation of concerns
- ✅ Easier testing and maintenance

## 📦 Installation

### 1. Install Root Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

Or use the convenience script:

```bash
npm run setup
```

## ⚙️ Configuration

### Frontend Configuration

1. **Create `.env.local` in project root:**

```bash
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# Backend API URL
API_BASE_URL=http://localhost:3001
```

### Backend Configuration

1. **Download Firebase Service Account:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to **Project Settings** → **Service Accounts**
   - Click **"Generate New Private Key"**
   - Save as `firebase-service-account.json` in `server/` directory

2. **Create `server/.env`:**

```bash
cd server
cp .env.example .env
```

3. **Edit `server/.env`:**

```bash
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Frontend URL for CORS
CORS_ORIGIN=http://localhost:3000
```

## 🎯 Running the Application

### Option 1: Run Full-Stack (Recommended)

Runs both frontend and backend concurrently:

```bash
npm start
```

This will:
- Start backend API server on `http://localhost:3001`
- Start frontend dev server on `http://localhost:3000`
- Open browser automatically

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### Option 3: Backend Only

```bash
cd server
npm run dev
```

Test with:
```bash
curl http://localhost:3001/health
```

## 🧪 Testing

### Run All Tests

```bash
npm run test:all
```

### Test Frontend Only

```bash
npm test
```

### Test Backend Only

```bash
npm run test:backend
```

### Test with Coverage

```bash
cd server
npm run test:coverage
```

## 📡 API Endpoints

Backend server exposes the following endpoints:

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/verify       - Verify Firebase ID token
GET  /api/auth/me          - Get current user info
POST /api/auth/revoke      - Revoke all sessions
```

### Projects
```
GET    /api/projects          - Get all projects
POST   /api/projects          - Save all projects
POST   /api/projects/add      - Add new project
PUT    /api/projects/:index   - Update project
DELETE /api/projects/:index   - Delete project
```

All project endpoints require authentication via `Authorization: Bearer <token>` header.

## 🔄 Migration from Client-Only to Full-Stack

The frontend has been updated to use the backend API while maintaining backward compatibility:

1. **Authentication Flow:**
   - Frontend: Firebase Web SDK for sign-in UI
   - Backend: Firebase Admin SDK for token verification
   - After sign-in, frontend gets ID token and sends to backend

2. **Data Flow:**
   ```
   User Action → Frontend → API Client → Backend API
                                            ↓
                                     Firebase Admin SDK
                                            ↓
                                        Firestore
   ```

3. **Benefits:**
   - Server-side validation prevents malicious data
   - Centralized business logic (rate limiting, sanitization)
   - Better security (API keys not exposed in frontend)
   - Easier to add features (just update backend API)

## 🔒 Security Features

Backend implements multiple security layers:

- **Firebase Admin SDK** - Server-side token verification
- **Helmet** - Security headers (XSS, clickjacking protection)
- **CORS** - Controlled cross-origin access
- **Rate Limiting** - 100 requests per 15 min per IP
- **Input Validation** - Express-validator on all inputs
- **XSS Protection** - HTML sanitization
- **Request Size Limits** - Max 10MB payloads
- **Logging** - Comprehensive audit trail

## 📁 Project Structure

```
Nan Diary/
├── src/                      # Frontend source
│   ├── js/
│   │   ├── apiClient.js     # NEW: Backend API client
│   │   ├── main.js          # Main app logic
│   │   ├── config.js        # Firebase client config
│   │   └── security.js      # Client-side security utils
│   └── css/
├── server/                   # NEW: Backend server
│   ├── src/
│   │   ├── config/          # Server configuration
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── index.js         # Server entry point
│   ├── tests/               # API tests
│   ├── logs/                # Log files
│   └── package.json
├── package.json              # Root package (frontend + scripts)
├── .env.local               # Frontend environment (gitignored)
└── README.md
```

## 🚢 Deployment

### Backend Deployment (Cloud Run / App Engine)

1. **Build Docker image:**
```bash
cd server
docker build -t nan-diary-api .
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy nan-diary-api \
  --image nan-diary-api \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=your-project-id
```

3. **Update frontend `.env.local`:**
```bash
API_BASE_URL=https://your-cloud-run-url
```

### Frontend Deployment (Firebase Hosting)

```bash
# Update API_BASE_URL in .env.local to production backend URL
npm run deploy
```

## 🐛 Troubleshooting

### Backend Won't Start

**Error: "Could not load the default credentials"**

Solution: Ensure `firebase-service-account.json` exists in `server/` directory and path is correct in `server/.env`.

### Frontend Can't Connect to Backend

**Error: "Failed to fetch" or CORS error**

Solution:
1. Verify backend is running on `http://localhost:3001`
2. Check `CORS_ORIGIN` in `server/.env` includes frontend URL
3. Check `API_BASE_URL` in root `.env.local`

### Rate Limit Exceeded

If you hit rate limits during development:

Edit `server/src/config/index.js`:
```javascript
rateLimit: {
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for dev
}
```

## 📊 Monitoring & Logs

Backend logs are written to `server/logs/`:
- `error-YYYY-MM-DD.log` - Error logs
- `combined-YYYY-MM-DD.log` - All logs

Logs rotate daily and are kept for 14 days.

View logs in development:
```bash
cd server
tail -f logs/combined-*.log
```

## 🔧 Development Workflow

1. **Start full-stack dev environment:**
   ```bash
   npm start
   ```

2. **Make changes to frontend:**
   - Edit files in `src/`
   - Browser auto-reloads

3. **Make changes to backend:**
   - Edit files in `server/src/`
   - Nodemon auto-restarts server

4. **Run tests:**
   ```bash
   npm run test:all
   ```

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: your feature"
   ```

## 📚 Next Steps

1. **Migrate frontend to use API client:**
   - Update `src/js/main.js` to call `apiClient` methods
   - Remove direct Firestore calls from frontend
   - Test authentication flow

2. **Add more API endpoints:**
   - User preferences
   - Search functionality
   - Export/import features

3. **Enhance security:**
   - Add request signing
   - Implement refresh token rotation
   - Add 2FA support

4. **Add monitoring:**
   - Set up error tracking (Sentry)
   - Add performance monitoring
   - Create health check dashboard

## 🆘 Getting Help

- **Backend API docs:** See `server/README.md`
- **API testing:** Use Postman or curl with examples in backend README
- **Issues:** Check GitHub issues or create new one
- **Logs:** Check `server/logs/` for detailed error information

## ✅ Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test:all`)
- [ ] Environment variables configured for production
- [ ] Firebase service account secured (not in git)
- [ ] CORS configured for production domain
- [ ] Rate limits appropriate for production traffic
- [ ] Logging configured and monitored
- [ ] Error tracking set up
- [ ] Database rules tested
- [ ] API endpoints documented
- [ ] Frontend updated to use production API URL
