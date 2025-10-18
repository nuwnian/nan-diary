#!/usr/bin/env node
// Deployment-time injection script - ONLY run during firebase deploy
// This script modifies deploy files with real API keys but never commits them

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.FIREBASE_API_KEY;

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || API_KEY === 'PLACEHOLDER_FOR_BUILD_INJECTION') {
    console.error('❌ ERROR: FIREBASE_API_KEY not set in .env.local');
    process.exit(1);
}

console.log('🚀 Starting deployment injection...');

// ONLY modify deploy files during deployment
const deployFiles = [
    'deploy/dashboard.html'
];

deployFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${filePath} (file not found)`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace all placeholder patterns with actual API key
    const beforeReplace = content;
    content = content.replace(/PLACEHOLDER_FOR_BUILD_INJECTION/g, API_KEY);
    content = content.replace(/YOUR_API_KEY_HERE/g, API_KEY);
    
    if (content !== beforeReplace) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Injected API key into ${filePath} for deployment`);
        console.log(`⚠️  WARNING: File ${filePath} now contains real API key - DO NOT COMMIT!`);
    } else {
        console.log(`ℹ️  No placeholders found in ${filePath}`);
    }
});

console.log('\n🎉 Deployment injection complete!');
console.log('⚠️  IMPORTANT: Deploy files now contain real API keys');
console.log('🚫 DO NOT commit these changes - they are for deployment only');