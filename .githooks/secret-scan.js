#!/usr/bin/env node
// Enhanced scanner for common secret patterns in staged files.
// Behavior:
//  - If gitleaks is available via npx, prefer to run it on staged changes.
//  - Otherwise, fall back to regex-based scanning over staged file contents.
// Usage: node .githooks/secret-scan.js <file1> <file2> ...

import fs from 'fs';
import path from 'path';
import child from 'child_process';

const patterns = [
  { name: 'Google API Key', re: /AIzaSy[0-9A-Za-z_-]{33}/g },
  { name: 'AWS Access Key ID', re: /AKIA[0-9A-Z]{16}/g },
  // AWS Secret Access Key heuristic (40 base64-like chars) - may be noisy
  { name: 'AWS Secret Key (heuristic)', re: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g },
  { name: 'Slack token', re: /xox[baprs]-[0-9A-Za-z-]{10,}/g },
  { name: 'GitHub token (ghp/gho/ghs/gha)', re: /gh[oprs]_[0-9A-Za-z_]{36}/g },
  { name: 'Stripe secret key', re: /sk_(live|test)_[0-9a-zA-Z]{24,}/g },
  { name: 'Twilio API key (SK)', re: /SK[0-9a-fA-F]{32}/g },
  { name: 'OAuth Bearer token (heuristic)', re: /Bearer\s+[A-Za-z0-9\-\._~\+/]+=*/g },
  { name: 'Private Key', re: /-----BEGIN (RSA|PRIVATE|ENCRYPTED PRIVATE|EC) KEY-----/g },
  { name: 'Generic long base64', re: /[A-Za-z0-9+/]{100,}={0,2}/g }
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

// Helper: get staged files when no args passed
function getStagedFiles() {
  try {
    const out = child.execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
    if (!out) return [];
    return out.split(/\r?\n/).filter(Boolean);
  } catch (e) {
    return [];
  }
}

// Try to run gitleaks (via npx) on staged changes for a robust, maintained scan
function runGitleaksStaged() {
  try {
    console.log('Attempting to run gitleaks (via npx) on staged changes...');
    const res = child.spawnSync('npx', ['gitleaks', 'detect', '--staged', '--no-git', '--report-format', 'json'], { encoding: 'utf8' });
    if (res.error) {
      // npx not available or gitleaks missing - fallback
      return { ok: false, error: res.error };
    }
    // gitleaks exit code 0 = no findings, 1 = findings, other = error
    if (res.status === 0) {
      console.log('gitleaks: no leaks detected');
      return { ok: true, findings: [] };
    }
    if (res.status === 1) {
      // Try to parse JSON output
      try {
        const out = res.stdout || res.stderr || '';
        const parsed = JSON.parse(out);
        return { ok: false, findings: parsed };
      } catch (e) {
        return { ok: false, error: res.stdout || res.stderr || 'gitleaks found leaks (non-JSON output)' };
      }
    }
    return { ok: false, error: res.stdout || res.stderr };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

let files = process.argv.slice(2);
if (files.length === 0) {
  // Default to scanning staged files
  files = getStagedFiles();
}

// Only scan sensible text file extensions to cut down false positives
const allowedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', '.md', '.env', '.txt', '.yaml', '.yml'];

function shouldScanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  // If file has no ext (e.g. script files), allow scanning
  if (!ext) return true;
  // Normalize separators and lowercase for consistent checks across OSes
  const low = filePath.replace(/\\/g, '/').toLowerCase();
  // Skip repository tooling directories (hooks, scripts, CI configs, deploy)
  if (low.includes('/.githooks/') || low.startsWith('.githooks/') || low.includes('/scripts/') || low.startsWith('scripts/') || low.includes('/.github/') || low.startsWith('.github/') || low.includes('/deploy/') || low.startsWith('deploy/')) {
    return false;
  }
  return allowedExtensions.includes(ext);
}

// If there are staged files, try gitleaks first (preferred)
if (files.length > 0) {
  // If all staged files are within tooling directories (.githooks, scripts, .github, deploy),
  // skip trying gitleaks to allow updating hooks themselves (avoids bootstrap lock).
  const allTooling = files.every(f => {
    const low = f.toLowerCase();
    return low.startsWith('.githooks') || low.startsWith('scripts') || low.startsWith('.github') || low.startsWith('deploy');
  });
  let gRes = { ok: false };
  if (!allTooling) {
    gRes = runGitleaksStaged();
  } else {
    console.log('All staged files are tooling files; skipping gitleaks run to allow hook updates');
  }
  if (gRes.ok) {
    process.exit(0);
  }
  // If gitleaks returned findings or errors, fall back to regex scan for more precise messages
  if (gRes.findings && gRes.findings.length > 0) {
    // Convert gitleaks findings into our output and block
    console.error('\ngitleaks detected potential secrets:');
    try {
      gRes.findings.forEach(f => {
        console.error(` - ${f.Rule} in ${f.File} (line ${f.StartLine || 'unknown'})`);
      });
    } catch (e) {
      console.error(gRes.findings);
    }
    console.error('\nPush blocked. Remove secrets or add to .secrets-whitelist before pushing.');
    process.exit(2);
  }
  // If gitleaks couldn't run, continue with regex scanning of the explicit files
}

if (files.length === 0) {
  // No files to scan
  console.log('No staged files to scan.');
  process.exit(0);
}

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const stat = fs.statSync(f);
  if (stat.isDirectory()) return;
  if (!shouldScanFile(f)) return;
  let content;
  try { content = fs.readFileSync(f, 'utf8'); } catch (e) { return; }
  // Remove BOM, control characters, and normalize unicode
  const normalized = content
    .replace(/^\uFEFF/, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .normalize('NFKC')
    .replace(/`/g, '');
  const lines = normalized.split(/\r?\n/);
  patterns.forEach(p => {
    lines.forEach((line, idx) => {
      let match;
      // Use exec loop to capture overlapping/global matches
      const re = new RegExp(p.re.source, p.re.flags.replace('g',''));
      while ((match = p.re.exec(line)) !== null) {
        const matchText = match[0];
        if (!whitelist.includes(matchText)) {
          found.push({ file: f, pattern: p.name, line: idx + 1, match: matchText });
        }
      }
      // Reset lastIndex for global regex
      p.re.lastIndex = 0;
    });
  })
});

if (found.length > 0) {
  console.error('\nSecret patterns detected:');
  found.forEach(x => console.error(` - ${x.pattern} in ${x.file}:${x.line} => ${x.match}`));
  console.error('\nPush blocked. Remove secrets, rotate exposed keys, or add an exact match to .secrets-whitelist if this is intentional.');
  console.error('\nSuggested remediation commands:');
  console.error('  // Unstage a file:');
  console.error('  git restore --staged <file>');
  console.error('  // Revert local changes in a file:');
  console.error('  git checkout -- <file>');
  console.error('  // Revert injected placeholders (project helper):');
  console.error('  node revert-placeholders.js');
  console.error('  // If you must bypass the hook (emergency):');
  console.error('  git commit --no-verify OR git push --no-verify');
  process.exit(2);
}

process.exit(0);
