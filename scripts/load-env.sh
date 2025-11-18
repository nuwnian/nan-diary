#!/bin/bash
# Helper script to load Firebase API key from GitHub Codespace secrets
# Run this in your Codespace terminal if the API key is stored in Codespace secrets

echo "Checking for Firebase API key in Codespace secrets..."

if [ -n "$VITE_FIREBASE_API_KEY" ]; then
    echo "✅ Found VITE_FIREBASE_API_KEY in environment"
    # Update .env.local with the actual key
    sed -i "s/YOUR_REAL_FIREBASE_API_KEY_HERE/$VITE_FIREBASE_API_KEY/g" .env.local
    echo "✅ Updated .env.local with your API key"
elif [ -n "$FIREBASE_API_KEY" ]; then
    echo "✅ Found FIREBASE_API_KEY in environment"
    # Update .env.local with the actual key
    sed -i "s/YOUR_REAL_FIREBASE_API_KEY_HERE/$FIREBASE_API_KEY/g" .env.local
    echo "✅ Updated .env.local with your API key"
else
    echo "❌ Firebase API key not found in Codespace environment"
    echo ""
    echo "You need to add your Firebase API key manually:"
    echo "1. Go to Firebase Console: https://console.firebase.google.com/"
    echo "2. Select project: nan-diary-6cdba"
    echo "3. Go to Project Settings > General > Your apps > Web app"
    echo "4. Copy the 'apiKey' value"
    echo "5. Edit .env.local and replace YOUR_REAL_FIREBASE_API_KEY_HERE with your actual key"
    echo ""
    echo "OR add it to Codespace secrets:"
    echo "1. Go to: https://github.com/nuwnian/nan-diary/settings/secrets/codespaces"
    echo "2. Add secret: VITE_FIREBASE_API_KEY with your API key value"
    echo "3. Rebuild your Codespace"
fi
