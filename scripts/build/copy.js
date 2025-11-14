#!/usr/bin/env node

// Cross-platform copy script
const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
    }
}

function copyFile(source, destination) {
    try {
        const destDir = path.dirname(destination);
        ensureDirectoryExists(destDir);
        fs.copyFileSync(source, destination);
        console.log(`📄 Copied: ${source} → ${destination}`);
    } catch (error) {
        console.error(`❌ Failed to copy ${source}: ${error.message}`);
    }
}

function copyDirectory(source, destination) {
    try {
        ensureDirectoryExists(destination);
        const items = fs.readdirSync(source);
        
        for (const item of items) {
            const sourcePath = path.join(source, item);
            const destPath = path.join(destination, item);
            const stat = fs.statSync(sourcePath);
            
            if (stat.isDirectory()) {
                copyDirectory(sourcePath, destPath);
            } else {
                copyFile(sourcePath, destPath);
            }
        }
    } catch (error) {
        console.error(`❌ Failed to copy directory ${source}: ${error.message}`);
    }
}

console.log('📦 Copying files for deployment...');

// Ensure deploy directory exists
ensureDirectoryExists('deploy');

// Copy HTML files
copyFile('dashboard.html', path.join('deploy', 'dashboard.html'));
copyFile('index.html', path.join('deploy', 'index.html'));

// Copy src directory
copyDirectory('src', path.join('deploy', 'src'));

console.log('✅ Copy completed!');