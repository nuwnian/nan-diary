#!/usr/bin/env node

// Build script to replace environment variables in production
const fs = require('fs');
const path = require('path');

const CONFIG_TEMPLATE = {
    apiKey: 'window.ENV.FIREBASE_API_KEY', // This placeholder will reference the injected value
    authDomain: 'nan-diary-6cdba.firebaseapp.com',
    projectId: 'nan-diary-6cdba',
    storageBucket: 'nan-diary-6cdba.firebasestorage.app',
    messagingSenderId: '709052515369',
    appId: '1:709052515369:web:0457058cd8b7d22010c838',
    measurementId: 'G-KJZR72YVR8'
};

function replaceConfigInFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the Firebase config
    const configRegex = /const firebaseConfig = \{[\s\S]*?\};/;
    const newConfig = `const firebaseConfig = {
    "apiKey": window.ENV.FIREBASE_API_KEY,
    "authDomain": "${CONFIG_TEMPLATE.authDomain}",
    "projectId": "${CONFIG_TEMPLATE.projectId}",
    "storageBucket": "${CONFIG_TEMPLATE.storageBucket}",
    "messagingSenderId": "${CONFIG_TEMPLATE.messagingSenderId}",
    "appId": "${CONFIG_TEMPLATE.appId}",
    "measurementId": "${CONFIG_TEMPLATE.measurementId}"
};`;
    
    content = content.replace(configRegex, newConfig);
    
    // Replace placeholder API key if found
    content = content.replace(/["']SECURE_PLACEHOLDER_DO_NOT_COMMIT_REAL_KEY["']/g, `"${CONFIG_TEMPLATE.apiKey}"`);
    content = content.replace(/["']PLACEHOLDER_WILL_BE_REPLACED_IN_BUILD["']/g, `"${CONFIG_TEMPLATE.apiKey}"`);
    content = content.replace(/["']REPLACE_WITH_YOUR_NEW_API_KEY["']/g, `"${CONFIG_TEMPLATE.apiKey}"`);
    
    // Replace process.env.FIREBASE_API_KEY with actual value
    content = content.replace(/process\.env\.FIREBASE_API_KEY \|\| ["']SECURE_PLACEHOLDER_DO_NOT_COMMIT_REAL_KEY["']/g, `"${CONFIG_TEMPLATE.apiKey}"`);
    
    // Replace window.ENV.FIREBASE_API_KEY assignments
    content = content.replace(/window\.ENV\.FIREBASE_API_KEY = window\.ENV\.FIREBASE_API_KEY \|\| ["']SECURE_PLACEHOLDER_DO_NOT_COMMIT_REAL_KEY["'];/g, 
        `window.ENV.FIREBASE_API_KEY = "${CONFIG_TEMPLATE.apiKey}";`);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated config in: ${filePath}`);
}

function main() {
    console.log('🔧 Building production configuration...');
    
    // ONLY update files in the deploy directory - NEVER modify source files!
    const filesToUpdate = [
        'deploy/dashboard.html',
        'deploy/src/js/config.js'
    ];
    
    filesToUpdate.forEach(file => {
        replaceConfigInFile(file);
    });
    
    if (CONFIG_TEMPLATE.apiKey === 'SECURE_PLACEHOLDER_DO_NOT_COMMIT_REAL_KEY') {
        console.log('⚠️  WARNING: FIREBASE_API_KEY environment variable not set!');
        console.log('   Production build will not work without a valid API key.');
    } else {
        console.log('✅ Production build configured successfully!');
    }
}

if (require.main === module) {
    main();
}

module.exports = { replaceConfigInFile, CONFIG_TEMPLATE };