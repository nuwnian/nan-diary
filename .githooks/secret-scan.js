#!/usr/bin/env node
// Simple scanner for common secret patterns in files passed as args
// Usage: node .githooks/secret-scan.js <file1> <file2> ...

const fs = require('fs');
const path = require('path');

const patterns = [
  {name: 'Google API Key', re: /AIzaSy[0-9A-Za-z_-]{35}/g},
  {name: 'AWS Access Key', re: /AKIA[0-9A-Z]{16}/g},
  {name: 'Slack token', re: /xox[baprs]-[0-9A-Za-z-]{10,}/g},
  {name: 'Private Key', re: /-----BEGIN (RSA|PRIVATE) KEY-----/g}
];

let found = [];

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('No files supplied to secret-scan.js');
  process.exit(0);
}

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const stat = fs.statSync(f);
  if (stat.isDirectory()) return;
  let content;
  try { content = fs.readFileSync(f, 'utf8'); } catch (e) { return; }
  patterns.forEach(p => {
    if (content.match(p.re)) {
      found.push({file: f, pattern: p.name});
    }
  })
});

if (found.length > 0) {
  console.error('\nSecret patterns detected:');
  found.forEach(x => console.error(` - ${x.pattern} in ${x.file}`));
  console.error('\nPush blocked. Remove secrets or add to .gitignore before pushing.');
  process.exit(2);
}

process.exit(0);
