# 🔧 Fix: Google Sign-Up Not Working

## 🚨 Problem
When you click "Sign up with Google", the app shows an error: **"Firebase could not find the app"** or doesn't load.

## 🎯 Root Cause
The `.env.local` file was missing, so Firebase couldn't initialize. Without Firebase initialization, authentication cannot work.

## ✅ Solution

I've created the `.env.local` file for you. Now you need to add your Firebase API key using **one of these two methods**:

---

### **Method 1: Quick Fix (For Mobile Codespace)**

**Option A: Add to Codespace Secrets (Recommended)**
1. On your PC, go to: https://github.com/nuwnian/nan-diary/settings/secrets/codespaces
2. Click "New repository secret"
3. Name: `VITE_FIREBASE_API_KEY`
4. Value: Get your API key from Firebase Console (see below)
5. Click "Add secret"
6. **Rebuild your Codespace** (close and reopen, or rebuild container)
7. Run: `./scripts/load-env.sh` in the terminal to auto-populate `.env.local`

**Option B: Edit .env.local Manually**
1. Get your Firebase API key:
   - Go to: https://console.firebase.google.com/
   - Select project: **nan-diary-6cdba**
   - Go to **Project Settings** → **General** → **Your apps** → **Web app**
   - Copy the `apiKey` value (starts with `AIza...`)
2. In VS Code/Codespace, open `.env.local`
3. Replace `YOUR_REAL_FIREBASE_API_KEY_HERE` with your actual API key
4. Save the file

---

### **Method 2: Get Your API Key**

Your Firebase API key is in the Firebase Console:

1. Go to: https://console.firebase.google.com/
2. Select your project: **nan-diary-6cdba**
3. Click the gear icon (⚙️) → **Project settings**
4. Scroll to **Your apps** section
5. Find the **Web app** (SDKs)
6. Copy the `apiKey` value from the config object
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...", // ← Copy this
     authDomain: "nan-diary-6cdba.firebaseapp.com",
     ...
   };
   ```

---

## 🧪 After Adding the API Key

Once you've added your API key, run these commands in the terminal:

```bash
# Install dependencies (if needed)
npm install

# Start the dev server
npm run dev
```

Then:
1. Open the app URL shown in the terminal (usually `http://localhost:5173`)
2. Click "Sign up with Google"
3. It should now work! ✅

---

## 🔒 Security Note

- The `.env.local` file is already in `.gitignore` so your API key won't be committed
- Your API key is **safe** for client-side use (it's meant to be public)
- Firebase security rules protect your data, not the API key

---

## 📋 Files Changed

- ✅ Created `.env.local` with placeholder
- ✅ Created `scripts/load-env.sh` helper script

---

## 💡 When You're Back on Your PC

After I commit and push these changes:

```bash
# Pull the changes
git pull origin main

# Add your API key to .env.local (same as above)
# Then run:
npm run dev
```

---

## 🆘 Still Not Working?

If you add the API key and it still doesn't work:

1. **Clear browser cache** (Ctrl+Shift+Delete → "All time")
2. **Use Incognito window** to test
3. Check that **Google sign-in is enabled** in Firebase Console:
   - Firebase Console → Authentication → Sign-in method → Google → Enable
4. Check browser console (F12) for specific error messages
