#!/usr/bin/env node
// Simple scanner for common secret patterns in files passed as args
// Usage: node .githooks/secret-scan.js <file1> <file2> ...

const fs = require('fs');
const path = require('path');

const patterns = [
  {name: 'Google API Key', re: /AIzaSy[0-9A-Za-z_-]{35}/gi},
  {name: 'AWS Access Key', re: /AKIA[0-9A-Z]{16}/gi},
  {name: 'Slack token', re: /xox[baprs]-[0-9A-Za-z-]{10,}/gi},
  {name: 'Private Key', re: /-----BEGIN (RSA|PRIVATE) KEY-----/gi}
];

let found = [];
// Load whitelist (if present)
let whitelist = [];
try {
  const wlPath = path.join(process.cwd(), '.secrets-whitelist');
  if (fs.existsSync(wlPath)) {
    whitelist = fs.readFileSync(wlPath, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }
} catch (e) {
  // ignore
}

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
  // Normalize unicode and remove backticks to avoid markdown wrapping hiding matches
  const normalized = content.normalize('NFKC').replace(/`/g, '');
  const lines = normalized.split(/\r?\n/);
  patterns.forEach(p => {
    lines.forEach((line, idx) => {
      const m = line.match(p.re);
      if (m) {
        m.forEach(matchText => {
          // Ignore if match exactly equals a whitelist entry
          if (!whitelist.includes(matchText)) {
            found.push({file: f, pattern: p.name, line: idx+1, match: matchText});
          }
        });
      }
    });
  })
});

if (found.length > 0) {
  console.error('\nSecret patterns detected:');
  found.forEach(x => console.error(` - ${x.pattern} in ${x.file}:${x.line} => ${x.match}`));
  console.error('\nPush blocked. Remove secrets or add to .gitignore before pushing.');
  process.exit(2);
}

process.exit(0);
