# 🚀 Nan Diary Full-Stack - Quick Reference

## One-Command Setup

```bash
# Clone, install everything, and you're ready!
git clone https://github.com/nuwnian/nan-diary.git
cd nan-diary
npm run setup
```

## Configuration (2 minutes)

### 1. Frontend Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Firebase Web SDK credentials
```

### 2. Backend Environment
```bash
cd server
cp .env.example .env
# Add Firebase service account JSON path
```

## Run Application

```bash
# Full-stack (frontend + backend)
npm start

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## Testing

```bash
# Run all tests
npm run test:all

# Frontend tests only
npm test

# Backend tests only
npm run test:backend

# Backend with coverage
cd server && npm run test:coverage
```

## API Endpoints

### Authentication
```bash
POST /api/auth/verify       # Verify Firebase token
GET  /api/auth/me          # Get user info
POST /api/auth/revoke      # Revoke sessions
```

### Projects (require auth)
```bash
GET    /api/projects           # Get all projects
POST   /api/projects           # Save projects
POST   /api/projects/add       # Add new project
PUT    /api/projects/:index    # Update project
DELETE /api/projects/:index    # Delete project
```

## Testing API with curl

```bash
# Health check
curl http://localhost:3001/health

# Verify token
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"idToken":"YOUR_FIREBASE_TOKEN"}'

# Get projects (requires auth)
curl http://localhost:3001/api/projects \
    -H "Authorization: Bearer <FIREBASE_ID_TOKEN>"
```

## Common Tasks

### Add new API endpoint

1. Add method to service (`server/src/services/`)
2. Add route (`server/src/routes/`)
3. Add validation middleware
4. Write test (`server/tests/`)
5. Update API docs

### Update frontend to use API

1. Use `window.apiClient` methods
2. Handle responses/errors
3. Update UI accordingly
4. See `docs/FRONTEND-MIGRATION-GUIDE.md`

## Project Structure (Simplified)

```
├── src/              # Frontend (HTML/CSS/JS)
│   └── js/
│       ├── apiClient.js    # API communication
│       └── main.js         # UI logic
├── server/           # Backend (Node.js/Express)
│   └── src/
│       ├── config/         # Configuration
│       ├── middleware/     # Express middleware
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       └── utils/          # Utilities
└── docs/             # Documentation
```

## Environment Variables

### Frontend (`.env.local`)
```bash
FIREBASE_API_KEY=xxx
FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxx
API_BASE_URL=http://localhost:3001
```

### Backend (`server/.env`)
```bash
PORT=3001
NODE_ENV=development
FIREBASE_PROJECT_ID=xxx
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
CORS_ORIGIN=http://localhost:3000
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is available
netstat -ano | findstr :3001

# Check service account exists
ls server/firebase-service-account.json

# Check logs
cat server/logs/error-*.log
```

### Frontend can't connect
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check CORS settings in server/.env
CORS_ORIGIN=http://localhost:3000

# Check API_BASE_URL in .env.local
```

### "401 Unauthorized" errors
- User needs to sign in again
- Token expired (normal after 1 hour)
- Check that token is being sent in Authorization header

## Deployment Checklist

- [ ] Update `API_BASE_URL` to production backend URL
- [ ] Deploy backend to Cloud Run/App Engine
- [ ] Update CORS_ORIGIN in backend to production frontend URL
- [ ] Deploy frontend to Firebase Hosting
- [ ] Test authentication flow
- [ ] Verify API endpoints work
- [ ] Check logs for errors

## Useful Commands

```bash
# View logs
tail -f server/logs/combined-*.log

# Test backend health
curl http://localhost:3001/health

# Lint code
npm run lint              # Frontend
npm run lint:backend      # Backend

# Clean and rebuild
npm run clean
npm run build

# Firebase deploy
npm run deploy
```

## Security Reminders

- ❌ Never commit `.env.local` or `server/.env`
- ❌ Never commit `firebase-service-account.json`
- ✅ Keep secrets in environment variables only
- ✅ Use `.gitignore` to protect sensitive files
- ✅ Rotate exposed keys immediately

## Getting Help

1. **Documentation:**
   - Setup: `docs/FULLSTACK-SETUP.md`
   - Backend API: `server/README.md`
   - Migration: `docs/FRONTEND-MIGRATION-GUIDE.md`

2. **Logs:**
   - Backend: `server/logs/`
   - Browser console for frontend

3. **Issues:**
   - Create GitHub issue with logs and error details

## Package Scripts Reference

```bash
# Root package.json
npm start              # Run full-stack
npm run dev:fullstack  # Run both frontend + backend
npm run dev:frontend   # Frontend only
npm run dev:backend    # Backend only
npm test               # Frontend tests
npm run test:backend   # Backend tests
npm run test:all       # All tests
npm run lint           # Lint frontend
npm run lint:backend   # Lint backend
npm run setup          # Install all dependencies
npm run build          # Build frontend
npm run deploy         # Deploy to Firebase

# Server package.json (cd server)
npm start              # Production server
npm run dev            # Development with auto-reload
npm test               # Run tests
npm run test:coverage  # Tests with coverage
npm run lint           # Lint backend code
```

## Key Files to Know

- `package.json` - Root dependencies and scripts
- `server/package.json` - Backend dependencies
- `server/src/index.js` - Backend entry point
- `src/js/main.js` - Frontend main logic
- `src/js/apiClient.js` - Backend API client
- `server/src/config/index.js` - Backend configuration
- `server/README.md` - Comprehensive backend docs

## Architecture at a Glance

```
User Browser
    ↓
Firebase Auth (Web SDK) → Get ID Token
    ↓
Frontend (apiClient.js)
    ↓
HTTP Request (Authorization header with a token)
    ↓
Backend API (Express)
    ↓
Authentication Middleware (verify token)
    ↓
Business Logic (Services)
    ↓
Firebase Admin SDK
    ↓
Firestore Database
```

## Status

✅ **Backend:** Complete and tested
🔄 **Frontend Migration:** Follow migration guide
📚 **Documentation:** Comprehensive guides available
🧪 **Testing:** Backend tests passing

---

**Next Step:** Follow `docs/FRONTEND-MIGRATION-GUIDE.md` to update frontend to use the API!
