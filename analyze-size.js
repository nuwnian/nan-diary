#!/usr/bin/env node
// App Size Analyzer - Check your Nan Diary app size breakdown

const fs = require('fs');
const path = require('path');

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (error) {
        return 0;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDirectory(dirPath, label) {
    console.log(`\n=== ${label} ===`);
    
    if (!fs.existsSync(dirPath)) {
        console.log(`Directory ${dirPath} not found.`);
        return 0;
    }
    
    const files = [];
    let totalSize = 0;
    
    function scanDir(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                scanDir(fullPath);
            } else if (stats.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (['.html', '.css', '.js', '.json'].includes(ext)) {
                    const relativePath = path.relative(dirPath, fullPath);
                    files.push({
                        name: item,
                        path: relativePath,
                        size: stats.size
                    });
                    totalSize += stats.size;
                }
            }
        }
    }
    
    scanDir(dirPath);
    
    // Sort by size (largest first)
    files.sort((a, b) => b.size - a.size);
    
    // Display top files
    console.log('Largest files:');
    files.slice(0, 10).forEach(file => {
        console.log(`  ${file.name.padEnd(20)} ${formatBytes(file.size).padStart(8)} - ${file.path}`);
    });
    
    console.log(`\nTotal files: ${files.length}`);
    console.log(`Total size: ${formatBytes(totalSize)}`);
    
    return totalSize;
}

function analyzeApp() {
    console.log('🔍 Nan Diary App Size Analysis');
    console.log('==============================');
    
    // Analyze source files
    const sourceSize = analyzeDirectory('src', 'SOURCE FILES (src/)');
    
    // Analyze root files
    const rootFiles = ['dashboard.html', 'index.html', 'package.json'];
    let rootSize = 0;
    console.log('\n=== ROOT FILES ===');
    rootFiles.forEach(file => {
        const size = getFileSize(file);
        if (size > 0) {
            console.log(`  ${file.padEnd(20)} ${formatBytes(size).padStart(8)}`);
            rootSize += size;
        }
    });
    console.log(`Root files total: ${formatBytes(rootSize)}`);
    
    // Analyze deployed files
    const deploySize = analyzeDirectory('deploy', 'DEPLOYED FILES (deploy/)');
    
    // Summary
    console.log('\n📊 SUMMARY');
    console.log('===========');
    console.log(`Source code size:  ${formatBytes(sourceSize + rootSize)}`);
    console.log(`Deployed app size: ${formatBytes(deploySize)}`);
    console.log(`Compression ratio: ${deploySize > 0 ? ((deploySize / (sourceSize + rootSize)) * 100).toFixed(1) + '%' : 'N/A'}`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (deploySize > 500 * 1024) { // > 500KB
        console.log('⚠️  App is getting large (>500KB). Consider:');
        console.log('   - Code splitting');
        console.log('   - Minification');
        console.log('   - Tree shaking unused code');
    } else if (deploySize > 100 * 1024) { // > 100KB
        console.log('✅ App size is reasonable but could be optimized');
        console.log('   - Consider minifying CSS/JS for production');
    } else {
        console.log('✅ App size is excellent! (<100KB)');
    }
    
    console.log('\n🚀 Your app loads fast with this size!');
}

// Run analysis
if (require.main === module) {
    analyzeApp();
}

module.exports = { analyzeApp, analyzeDirectory, formatBytes };