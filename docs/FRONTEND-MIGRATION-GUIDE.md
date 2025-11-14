# Frontend Migration Guide

Guide for migrating the frontend from direct Firebase/Firestore calls to using the backend REST API.

## 🎯 Migration Strategy

The migration will be done incrementally while maintaining backward compatibility:

1. ✅ Add API client (`src/js/apiClient.js`) - **DONE**
2. 🔄 Update authentication flow to get and store ID token
3. 🔄 Replace `loadProjectsFromCloud()` to call API
4. 🔄 Replace `saveProjectsToCloud()` to call API
5. 🔄 Update project operations (add, update, delete)
6. ✅ Remove direct Firestore calls from frontend
7. ✅ Test thoroughly

## 📝 Code Changes Needed

### 1. Authentication Flow Updates

**Current:** Frontend uses Firebase Web SDK for auth and directly accesses Firestore.

**New:** Frontend uses Firebase Web SDK for auth, gets ID token, and sends to backend API.

#### In `src/js/main.js`:

```javascript
// After successful sign-in
async function signInWithGoogle() {
  await waitForFirebase();
  const isMobile = isMobileDevice();
  
  try {
    let result;
    if (window.authService) {
      result = await window.authService.signIn(!isMobile);
    } else {
      // ... existing code
    }
    
    // NEW: Get ID token and store in API client
    const user = result.user;
    const idToken = await user.getIdToken();
    window.apiClient.setToken(idToken);
    
    userId = user.uid;
    loadProjectsFromCloud(); // Will now call API
    console.log('Signed in successfully');
  } catch (error) {
    // ... error handling
  }
}

// Update auth state listener
waitForFirebase().then(() => {
  const authListener = async (user) => {
    if (user) {
      userId = user.uid;
      
      // NEW: Get and store ID token
      const idToken = await user.getIdToken();
      window.apiClient.setToken(idToken);
      
      loadProjectsFromCloud();
      // ... rest of UI updates
    } else {
      userId = null;
      window.apiClient.setToken(null);
      // ... rest of UI updates
    }
  };
  
  if (window.authService) {
    window.authService.onAuthStateChanged(authListener);
  } else {
    window.onAuthStateChanged(window.firebaseAuth, authListener);
  }
});
```

### 2. Load Projects from API

Replace direct Firestore call with API call:

```javascript
// OLD (direct Firestore):
async function loadProjectsFromCloud() {
  if (!userId || !isFirebaseReady) return;
  try {
    if (window.notesService) {
      data = await window.notesService.loadProjects(userId);
    } else {
      const docRef = window.doc(window.firebaseDb, 'diaryProjects', userId);
      const docSnap = await window.getDoc(docRef);
      if (docSnap.exists()) {
        data = docSnap.data().projects || [];
      }
    }
    // ...
  } catch (error) {
    console.error('Error loading from cloud:', error);
  }
}

// NEW (API call):
async function loadProjectsFromCloud() {
  if (!userId) return;
  
  try {
    const response = await window.apiClient.getProjects();
    
    if (response.success && response.projects) {
      projects.length = 0;
      projects.push(...response.projects);
      renderProjects();
      console.log('Projects loaded from API');
    }
  } catch (error) {
    console.error('Error loading from API:', error);
    // Show user-friendly error
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      alert('Session expired. Please sign in again.');
      signOutUser();
    }
  }
}
```

### 3. Save Projects to API

```javascript
// OLD (direct Firestore):
async function saveProjectsToCloud() {
  if (!userId || !isFirebaseReady) return;
  try {
    // Validate and sanitize...
    const sanitizedProjects = projects.map(/* ... */);
    
    if (window.notesService) {
      await window.notesService.saveProjects(userId, sanitizedProjects);
    } else {
      const docRef = window.doc(window.firebaseDb, 'diaryProjects', userId);
      await window.setDoc(docRef, { projects: sanitizedProjects });
    }
    console.log('Projects saved to cloud');
  } catch (error) {
    console.error('Error saving to cloud:', error);
  }
}

// NEW (API call):
async function saveProjectsToCloud() {
  if (!userId) {
    console.log('Skipping save: User not signed in');
    return;
  }
  
  try {
    const response = await window.apiClient.saveProjects(projects);
    
    if (response.success) {
      console.log('Projects saved to API');
    }
  } catch (error) {
    console.error('Error saving to API:', error);
    
    // Handle specific errors
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      const shouldSignIn = confirm('Your session has expired. Sign in again to save your changes?');
      if (shouldSignIn) {
        signInWithGoogle();
      }
    } else if (error.message.includes('ValidationError')) {
      alert('Please check your project content. Some content may be invalid.');
    } else {
      console.warn('Failed to save to API, but your changes are saved locally.');
    }
  }
}
```

### 4. Add New Project via API

```javascript
// In addNewProject() function:
function addNewProject() {
  const newProject = {
    title: 'New Project',
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    notes: ''
  };
  
  // Add to local array immediately for instant UI feedback
  projects.unshift(newProject);
  renderProjects();
  
  // Save to API in background
  saveProjectsToCloud();
  
  openDetail(0);
}

// OR use the dedicated add endpoint:
async function addNewProject() {
  const newProject = {
    title: 'New Project',
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    notes: ''
  };
  
  try {
    const response = await window.apiClient.addProject(newProject);
    
    if (response.success) {
      // Reload projects from API to ensure consistency
      await loadProjectsFromCloud();
      openDetail(0);
    }
  } catch (error) {
    console.error('Failed to add project:', error);
    alert('Failed to create project. Please try again.');
  }
}
```

### 5. Delete Project via API

```javascript
// In performDelete() function:
async function performDelete(index) {
  if (index >= 0 && index < projects.length) {
    try {
      // Call API to delete
      const response = await window.apiClient.deleteProject(index);
      
      if (response.success) {
        // Update local state
        projects.splice(index, 1);
        renderProjects();
        
        if (currentProjectIndex === index) {
          document.getElementById('detailView').style.display = 'none';
          document.body.style.overflow = 'auto';
          currentProjectIndex = null;
        }
        
        console.log('Project deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  }
}
```

### 6. Update HTML to Load API Client

In `dashboard.html`, add the API client script:

```html
<!-- After SecurityUtils, before main.js -->
<script src="src/js/apiClient.js?v=5"></script>
<script src="src/js/main.js?v=5"></script>
```

### 7. Update Environment Variable Injection

Add API base URL to `.env.local`:

```bash
# .env.local
FIREBASE_API_KEY=your-key
# ... other Firebase config ...

# Backend API URL
API_BASE_URL=http://localhost:3001
```

Update `inject-env.js` to inject API_BASE_URL:

```javascript
// In inject-env.js
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';

// Inject into HTML
window.ENV.FIREBASE_API_KEY = window.ENV.FIREBASE_API_KEY || "${apiKey}";
window.ENV.API_BASE_URL = window.ENV.API_BASE_URL || "${apiBaseUrl}";
```

## 🧪 Testing Checklist

After migration, test these scenarios:

- [ ] Sign in with Google (popup on desktop, redirect on mobile)
- [ ] Projects load correctly after sign in
- [ ] Create new project
- [ ] Edit project title and notes
- [ ] Auto-save works (debounced)
- [ ] Manual save (Ctrl+S)
- [ ] Delete project
- [ ] Sign out clears data
- [ ] Sign in again restores projects
- [ ] Offline behavior (graceful error messages)
- [ ] Session expiry handling
- [ ] Rate limit handling (if applicable)
- [ ] Mobile responsive design still works

## 🔄 Rollback Plan

If issues occur, you can rollback by:

1. Keep the old Firestore code commented out (don't delete immediately)
2. Use feature flag to switch between API and direct Firestore:

```javascript
const USE_API = window.ENV?.USE_API !== 'false'; // Default to true

async function loadProjectsFromCloud() {
  if (USE_API) {
    return loadFromAPI();
  } else {
    return loadFromFirestore();
  }
}
```

3. If API fails, temporarily set `USE_API=false` in environment

## 🚀 Deployment

After testing locally:

1. Deploy backend first:
```bash
cd server
# Deploy to Cloud Run/App Engine
```

2. Update production `.env.local`:
```bash
API_BASE_URL=https://your-backend-url.run.app
```

3. Deploy frontend:
```bash
npm run deploy
```

## ✅ Benefits After Migration

- ✅ **Better Security:** Server-side validation prevents malicious data
- ✅ **Centralized Logic:** Business rules in one place (backend)
- ✅ **Easier Testing:** API endpoints are easier to test
- ✅ **Better Performance:** Backend can optimize queries
- ✅ **Scalability:** Can add caching, load balancing on backend
- ✅ **Maintenance:** Frontend becomes simpler, just UI logic

## 🆘 Troubleshooting

### "Failed to fetch" Error

**Cause:** Backend not running or CORS issue

**Solution:**
1. Verify backend is running: `curl http://localhost:3001/health`
2. Check CORS settings in `server/.env`
3. Check browser console for detailed error

### "401 Unauthorized" Error

**Cause:** Token expired or not sent

**Solution:**
1. User needs to sign in again
2. Check that `apiClient.setToken()` is called after sign-in
3. Verify token is being sent in request headers

### Projects Not Loading

**Cause:** API endpoint issue or authentication problem

**Solution:**
1. Check backend logs: `server/logs/combined-*.log`
2. Test API directly with curl:
   ```bash
  curl -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" http://localhost:3001/api/projects
   ```
3. Verify Firebase service account is configured correctly

## 📞 Support

If you encounter issues during migration:
1. Check backend logs in `server/logs/`
2. Check browser console for frontend errors
3. Test API endpoints with curl/Postman
4. Review this guide's examples
5. Create GitHub issue with detailed error logs
