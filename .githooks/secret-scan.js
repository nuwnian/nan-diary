#!/usr/bin/env node
// Simple scanner for common secret patterns in files passed as args
// Usage: node .githooks/secret-scan.js <file1> <file2> ...

const fs = require('fs');
const path = require('path');

const patterns = [
  {name: 'Google API Key', re: /AIzaSy[0-9A-Za-z_-]{33}/gi},
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

let files = process.argv.slice(2);
if (files.length === 0) {
  // No files specified — run the gitleaks wrapper for a thorough scan
  try {
    const spawn = require('child_process').spawnSync;
    const res = spawn('node', [path.join(process.cwd(), 'gitleaks-wrapper.js')], {encoding: 'utf8'});
    if (res.status !== 0) {
      console.error(res.stdout || res.stderr);
      process.exit(res.status || 1);
    }
    console.log(res.stdout || 'gitleaks wrapper completed');
    process.exit(0);
  } catch (e) {
    console.error('Failed to run gitleaks wrapper', e);
    process.exit(2);
  }
}

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const stat = fs.statSync(f);
  if (stat.isDirectory()) return;
  let content;
  try { content = fs.readFileSync(f, 'utf8'); } catch (e) { return; }
  // Remove BOM, control characters, and normalize unicode
  const normalized = content
    .replace(/^\uFEFF/, '')                             // Remove UTF-8 BOM
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')  // Remove control characters except \n and \r
    .normalize('NFKC')                                  // Normalize unicode
    .replace(/`/g, '');                                 // Remove backticks
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
