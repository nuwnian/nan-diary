// Script to inject environment variables into source files for LOCAL DEVELOPMENT ONLY
// This should NOT be used for deployment - use deploy-inject.js instead
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.FIREBASE_API_KEY;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || API_KEY === 'PLACEHOLDER_FOR_LOCAL_DEV') {
    console.error('❌ ERROR: FIREBASE_API_KEY not set in .env.local');
    process.exit(1);
}

console.log('⚠️  WARNING: This script modifies SOURCE files for development.');
console.log('⚠️  Make sure to revert source files to placeholders before committing!');
console.log('⚠️  Use deploy-inject.js for production deployment.\n');

// Files to process for LOCAL DEVELOPMENT ONLY
const files = [
    '../../dashboard.html'  // Adjusted path since script is now in scripts/build/
    // Note: Source files should be reverted to placeholders before git commit
    // Only deploy/ files should contain real API keys (and deploy/ is gitignored)
];

files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${filePath} (file not found)`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace placeholder with actual API key
    content = content.replace(/YOUR_API_KEY_HERE/g, API_KEY);
    content = content.replace(/PLACEHOLDER_FOR_BUILD_INJECTION/g, API_KEY);

    // Replace window.ENV assignment patterns like:
    // window.ENV.FIREBASE_API_KEY = window.ENV.FIREBASE_API_KEY || "...";
    content = content.replace(/window\.ENV\.FIREBASE_API_KEY\s*=\s*window\.ENV\.FIREBASE_API_KEY\s*\|\|\s*["'][^"']*["']/g, `window.ENV.FIREBASE_API_KEY = window.ENV.FIREBASE_API_KEY || "${API_KEY}"`);

    // Replace API_BASE_URL placeholder
    content = content.replace(/PLACEHOLDER_API_BASE_URL/g, API_BASE_URL);
    content = content.replace(/window\.ENV\.API_BASE_URL\s*=\s*window\.ENV\.API_BASE_URL\s*\|\|\s*["'][^"']*["']/g, `window.ENV.API_BASE_URL = window.ENV.API_BASE_URL || "${API_BASE_URL}"`);

    // Replace JSON-style apiKey entries in firebaseConfig: "apiKey": "..."
    content = content.replace(/("apiKey"\s*:\s*")[^"]*(")/g, `$1${API_KEY}$2`);
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Injected API key into ${filePath} (LOCAL DEV)`);
});

console.log('\n🎉 Environment variables injected for LOCAL DEVELOPMENT!');
console.log('⚠️  Remember: Revert source files to placeholders before git commit!');
console.log('💡 Use "git checkout dashboard.html" to revert if needed.');
