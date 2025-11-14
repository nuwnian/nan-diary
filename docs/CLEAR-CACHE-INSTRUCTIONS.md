# 🔄 Clear Browser Cache - Fix API Key Issues

## Your Error:
You're seeing an old API key value in the UI instead of your real key. This is usually caused by browser caching of an old `dashboard.html`.
This guide uses placeholder values (`YOUR_API_KEY_HERE`) instead of showing real keys.

## ✅ How to Fix:

### Method 1: Hard Refresh (Recommended)
1. Close your app if it's open
2. Open `dashboard.html` again
3. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
   - This forces a hard refresh and clears cache

### Method 2: Clear Browser Data
1. Open your browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear site data** or **Clear storage**
4. Refresh the page (Ctrl + R)

### Method 3: Use Private/Incognito Window
1. Open a new Private/Incognito window
2. Open `dashboard.html` in the private window
3. This starts fresh without any cache

### Method 4: Clear Specific Cache via DevTools
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select **Empty Cache and Hard Reload**

## 🔍 Verify It's Fixed:

After clearing cache, open DevTools Console (F12) and check:
- You should see: "Firebase is ready, setting up auth listener"
- You should NOT see any 403 errors
- You should NOT see: 

## ⚠️ If Still Not Working:

1. **Check your `.env.local` file has the correct key:**
   ```
   FIREBASE_API_KEY=YOUR_API_KEY_HERE
   ```

2. **Re-run the injection script:**
   ```bash
   npm run dev
   ```
   or
   ```bash
   node inject-env.js
   ```

3. **Check `dashboard.html` has your correct key placeholder:**
   - Open `dashboard.html`
   - Search for `FIREBASE_API_KEY`
   - In the repository it should show the placeholder: `YOUR_API_KEY_HERE`. The real key is injected at dev/build time from `.env.local`.

## 🎯 Current Status:
- ✅ Script version updated to v=5 (forces new cache)
- ✅ Injection script ready to use

**Just hard refresh (Ctrl+Shift+R) and you should be good to go!** 🚀
