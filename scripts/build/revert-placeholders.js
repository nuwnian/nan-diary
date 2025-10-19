// Script to revert source files to safe placeholders before git commit
const fs = require('fs');
const path = require('path');

console.log('🔒 Reverting source files to safe placeholders...\n');

// Files to revert to placeholders
const files = [
    'dashboard.html',
    'index.html'
];

files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${filePath} (file not found)`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Replace any Firebase API key with placeholder
    const apiKeyPattern = /AIzaSy[A-Za-z0-9_-]{33}/g;
    if (apiKeyPattern.test(content)) {
        content = content.replace(apiKeyPattern, 'PLACEHOLDER_FOR_BUILD_INJECTION');
        modified = true;
    }
    
    // Replace window.ENV assignment with placeholder
    const envPattern = /window\.ENV\.FIREBASE_API_KEY\s*=\s*window\.ENV\.FIREBASE_API_KEY\s*\|\|\s*["'][^"']*["']/g;
    content = content.replace(envPattern, 'window.ENV.FIREBASE_API_KEY = window.ENV.FIREBASE_API_KEY || "PLACEHOLDER_FOR_BUILD_INJECTION"');
    
    // Replace JSON-style apiKey entries
    const jsonPattern = /("apiKey"\s*:\s*")[^"]*(")/g;
    content = content.replace(jsonPattern, '$1PLACEHOLDER_FOR_BUILD_INJECTION$2');
    
    if (modified || content !== fs.readFileSync(fullPath, 'utf8')) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Reverted ${filePath} to safe placeholder`);
    } else {
        console.log(`✨ ${filePath} already safe (no changes needed)`);
    }
});

console.log('\n🎉 All source files reverted to safe placeholders!');
console.log('✅ Safe to commit - no API keys in source files.');