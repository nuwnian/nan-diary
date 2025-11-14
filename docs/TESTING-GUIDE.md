# Testing the Frontend Migration

## Test Plan

### Phase 1: Backend Health Check (No Firebase Required)

Let's first verify the backend server can start and respond:

```powershell
# Start the backend
cd server
npm run dev
```

Expected output:
- ✅ Server should start on port 3001
- ✅ Should see: "🚀 Server running on http://localhost:3001"
- ✅ No Firebase errors (it will warn but continue)

Test the health endpoint:
```powershell
# In a new terminal
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-19T..."
}
```

### Phase 2: Frontend Setup

1. **Create `.env.local`** with your Firebase credentials:
```bash
# Copy the example
cp .env.local.example .env.local

# Edit .env.local and add your Firebase API key
# You can find it in Firebase Console → Project Settings → Web app
```

2. **Start the frontend:**
```powershell
# In a new terminal, from root directory
npm run dev:frontend
```

Expected output:
- ✅ Environment variables injected
- ✅ Live server starts on port 3000
- ✅ Browser opens to dashboard

### Phase 3: Integration Testing

With both backend and frontend running:

#### Test 1: Verify Scripts Loaded
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `window.apiClient`
4. Expected: Should show the apiClient object (not undefined)

#### Test 2: Check Environment Variables
In browser console:
```javascript
console.log(window.ENV.API_BASE_URL)
```
Expected: `http://localhost:3001`

#### Test 3: Test API Connection (Without Auth)
In browser console:
```javascript
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
```
Expected: `{status: "ok", timestamp: "..."}`

#### Test 4: Sign In (Requires Firebase)
1. Click "Sign In" button
2. Sign in with your Google account
3. Check browser console for:
   - ✅ "Signed in successfully"
   - ✅ "Projects loaded from API" (if backend has Firebase setup)
   - OR "Projects loaded from Firestore (fallback)" (if backend doesn't have Firebase)

#### Test 5: Verify API Client Token
After signing in, in browser console:
```javascript
// Check if token is set
window.apiClient.token ? "Token is set ✅" : "Token missing ❌"
```

#### Test 6: Backend Logs
Check backend terminal for:
- ✅ Request logs showing: `GET /api/projects`
- ✅ Response status: 200 or 401

### Phase 4: Full Integration (Requires Firebase Service Account)

To test the full API integration, you need:

1. **Firebase Service Account:**
   - Go to Firebase Console
   - Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `server/firebase-service-account.json`

2. **Update server/.env:**
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

3. **Restart backend:**
   ```powershell
   cd server
   npm run dev
   ```

4. **Test Full Flow:**
   - Sign in
   - Create new project
   - Edit project
   - Save (Ctrl+S)
   - Delete project
   - Check backend logs: Should see all API requests

### Expected Backend Logs (Success)

```
[timestamp] info: 🚀 Server running on http://localhost:3001
[timestamp] info: 📊 Environment: development
[timestamp] info: 🔥 Firebase initialized successfully
[timestamp] info: GET /health - 200 - 5ms
[timestamp] info: GET /api/projects - 200 - 45ms
[timestamp] info: POST /api/projects/save - 200 - 120ms
```

### Troubleshooting

#### Issue: "Cannot find module 'express'"
**Fix:** Install backend dependencies:
```powershell
cd server
npm install
```

#### Issue: "CORS error" in browser
**Fix:** Check `server/.env` has:
```bash
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
```

#### Issue: Backend starts but shows Firebase errors
**Expected:** This is normal without service account. Backend will still respond to API calls but won't be able to verify tokens or access Firestore.

**Temporary Fix for Testing:** Frontend will automatically fall back to direct Firestore access.

#### Issue: "apiClient is not defined"
**Fix:** Check that `dashboard.html` loads `apiClient.js`:
```html
<script src="src/js/apiClient.js?v=5"></script>
```

#### Issue: Projects not loading from API
**Check:**
1. Backend is running (`curl http://localhost:3001/health`)
2. Firebase service account is configured
3. User is signed in
4. Check browser console for errors
5. Check backend logs for request errors

### Quick Test Without Full Firebase Setup

If you want to test just the frontend changes without backend:

```powershell
# Just start frontend
npm run dev:frontend
```

The frontend will automatically use the Firestore fallback path, so existing functionality continues to work. The API integration code is there, ready to activate when the backend is available.

## Summary

- ✅ **Minimal test:** Start backend, check health endpoint
- ✅ **Frontend test:** Start frontend, verify apiClient loaded
- ✅ **Integration test:** Both running, sign in, check console logs
- ✅ **Full test:** With Firebase service account, test all CRUD operations

The migration is **backward compatible**, so even without the backend running, your app continues to work using direct Firestore access! 🎉
