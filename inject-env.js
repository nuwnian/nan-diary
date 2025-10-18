// Script to inject environment variables into HTML files before deployment
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.FIREBASE_API_KEY;

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || API_KEY === 'PLACEHOLDER_FOR_LOCAL_DEV') {
    console.error('❌ ERROR: FIREBASE_API_KEY not set in .env.local');
    process.exit(1);
}

// Files to process
const files = [
    'dashboard.html'
    // Note: deploy/dashboard.html should only be modified at deployment time
    // to prevent committing real API keys to the repository
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

    // Replace JSON-style apiKey entries in firebaseConfig: "apiKey": "..."
    content = content.replace(/("apiKey"\s*:\s*")[^"]*(")/g, `$1${API_KEY}$2`);
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Injected API key into ${filePath}`);
});

console.log('\n🎉 Environment variables injected successfully!');
