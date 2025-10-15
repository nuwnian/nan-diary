#!/usr/bin/env node

// Cross-platform clean script
const fs = require('fs');
const path = require('path');

function removeIfExists(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
                console.log(`🗑️  Removed directory: ${filePath}`);
            } else {
                fs.unlinkSync(filePath);
                console.log(`🗑️  Removed file: ${filePath}`);
            }
        }
    } catch (error) {
        console.log(`⚠️  Could not remove ${filePath}: ${error.message}`);
    }
}

console.log('🧹 Cleaning deploy directory...');

// Remove specific files and directories
removeIfExists(path.join('deploy', 'dashboard.html'));
removeIfExists(path.join('deploy', 'index.html'));
removeIfExists(path.join('deploy', 'src'));

console.log('✅ Clean completed!');