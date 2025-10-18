# 🔧 Google Cloud Authentication Troubleshooting

## 🚨 **Your Current Error:**
Based on your console logs:
- ✅ Firebase is initialized
- ✅ User can sign in
- ❌ Token validation fails with 403 error
- ❌ "Session expired, please sign in again"

---

## 🎯 **Root Causes & Solutions:**

### **1. Browser Cache Issue (Most Common)**

**Problem:** Your browser cached the old/wrong API key.

**Solution:**
1. Close all tabs with your app
2. Open a **new Incognito/Private window**
3. Open `dashboard.html` in the incognito window
4. Try signing in again

**OR:**
1. Press **Ctrl + Shift + Delete** (Windows) or **Cmd + Shift + Delete** (Mac)
2. Select "Cached images and files"
3. Select "All time"
4. Click "Clear data"
5. Refresh your app

---

### **2. Domain Not Authorized in Firebase Console**

**Problem:** Your domain isn't authorized for Firebase Authentication.

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nan-diary-6cdba`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Check if your domain is listed:
   - `localhost`
   - `127.0.0.1`
   - `file://` (if opening HTML directly)
   - Your deployed domain (if applicable)
5. If missing, click **Add domain** and add them

---

### **3. API Key Restrictions**

**Problem:** Your API key might be restricted in Google Cloud Console.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `nan-diary-6cdba`
3. Go to **APIs & Services** → **Credentials**
4. Find your API key: `AIzaSyDNqD7y8ikTpUOdjzILErMXoQ44xKjVLgQ`
5. Click on it to edit
6. Under **Application restrictions**:
   - Choose "None" (for testing) OR
   - Choose "HTTP referrers" and add your domains
7. Under **API restrictions**:
   - Make sure these are enabled:
     - Firebase Authentication API
     - Cloud Firestore API
     - Token Service API
     - Identity Toolkit API
8. Click **Save**

---

### **4. Firestore Rules Not Deployed**

**Problem:** Your security rules aren't deployed to Firebase.

**Solution:**
```bash
npm run deploy:rules
```

OR:
```bash
firebase deploy --only firestore:rules
```

---

### **5. Token Service API Blocked**

**Problem:** The error shows "requests-to-this-api-securetoken.googleapis.com...are-blocked"

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Enabled APIs & services**
4. Search for and enable:
   - ✅ **Identity Toolkit API** (Firebase Auth)
   - ✅ **Token Service API**
   - ✅ **Cloud Firestore API**
5. Click **Enable** if any are disabled

---

### **6. Firebase Project Configuration**

**Problem:** Your Firebase project settings might be incorrect.

**Solution - Verify in Firebase Console:**
1. Go to **Project Settings** → **General**
2. Check your Web App configuration matches:
   ```
   Project ID: nan-diary-6cdba
   API Key: AIzaSyDNqD7y8ikTpUOdjzILErMXoQ44xKjVLgQ
   Auth Domain: nan-diary-6cdba.firebaseapp.com
   ```

---

### **7. Authentication Provider Not Enabled**

**Problem:** Google sign-in isn't enabled in Firebase.

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nan-diary-6cdba`
3. Go to **Authentication** → **Sign-in method**
4. Find **Google** in the list
5. If it shows "Disabled", click on it
6. Toggle **Enable**
7. Select your support email
8. Click **Save**

---

## 🧪 **Testing Steps:**

### **Step 1: Verify API Key**
```bash
# In PowerShell, check your dashboard.html
Get-Content dashboard.html | Select-String -Pattern "AIzaSy"
```
Should show: `AIzaSyDNqD7y8ikTpUOdjzILErMXoQ44xKjVLgQ`

### **Step 2: Test in Clean Environment**
1. Open **Incognito/Private window**
2. Open your `dashboard.html`
3. Open DevTools (F12)
4. Try signing in
5. Check for errors

### **Step 3: Check Console Logs**
Look for these in browser console:
- ✅ "Firebase is ready, setting up auth listener"
- ✅ "User signed in: [your-email]"
- ❌ Should NOT see: 403 errors
- ❌ Should NOT see: "Session expired"

---

## 🔑 **Quick Checklist:**

- [ ] Browser cache cleared (or using Incognito)
- [ ] Correct API key in dashboard.html
- [ ] Google sign-in enabled in Firebase Console
- [ ] Domain authorized in Firebase Console
- [ ] Token Service API enabled in Google Cloud
- [ ] Firestore rules deployed
- [ ] No API key restrictions blocking Firebase

---

## 🆘 **Still Not Working?**

Try this diagnostic:

1. **Sign out completely**
2. **Clear ALL browser data** (Ctrl+Shift+Delete → All time)
3. **Restart your browser**
4. **Open in Incognito window**
5. **Run this command:**
   ```bash
   npm run dev
   ```
6. **Try signing in again**

---

## 📋 **Current Status:**

✅ Your API key: `AIzaSyDNqD7y8ikTpUOdjzILErMXoQ44xKjVLgQ`  
✅ Your project: `nan-diary-6cdba`  
✅ Firestore rules: Properly configured  
✅ Code: All fixes applied  

**Most likely issue: Browser cache with old API key**  
**Best solution: Use Incognito window to test**

---

## 💡 **Pro Tip:**

For development, always use `npm run dev` which:
1. Injects the latest API key
2. Starts a local server
3. Avoids file:// protocol issues

```bash
npm run dev
```

Then visit: `http://localhost:3000`
