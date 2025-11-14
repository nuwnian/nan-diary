#!/usr/bin/env node
// Wrapper to run gitleaks (via npx) and filter results using .secrets-whitelist
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function loadWhitelist(){
  const p = path.join(process.cwd(), '.secrets-whitelist');
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p,'utf8').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
}

const wl = loadWhitelist();

// Accept optional file arguments
const files = process.argv.slice(2);

function fallbackScan(fileList){
  // basic regex patterns (case-insensitive) similar to gitleaks default rules
  const patterns = [
    {name: 'Google API Key', re: /AIzaSy[0-9A-Za-z_-]{35}/gi},
    {name: 'AWS Access Key', re: /AKIA[0-9A-Z]{16}/gi},
    {name: 'Slack token', re: /xox[baprs]-[0-9A-Za-z-]{10,}/gi},
    {name: 'Private Key', re: /-----BEGIN (RSA|PRIVATE) KEY-----/gi}
  ];
  const found = [];
  fileList.forEach(f=>{
    if (!fs.existsSync(f)) return;
    const stat = fs.statSync(f);
    if (stat.isDirectory()) return;
    let content = fs.readFileSync(f,'utf8').normalize('NFKC').replace(/`/g,'');
    const lines = content.split(/\r?\n/);
    patterns.forEach(p=>{
      lines.forEach((line, idx)=>{
        const m = line.match(p.re);
        if (m){
          m.forEach(matchText=>{
            if (!wl.includes(matchText)){
              found.push({file: f, pattern: p.name, line: idx+1, match: matchText});
            }
          });
        }
      });
    });
  });
  return found;
}

// If files empty, use git ls-files to list all tracked files
let scanFiles = files;
if (scanFiles.length === 0){
  try{
    const gitLs = spawnSync('git', ['ls-files'], {encoding: 'utf8'});
    if (gitLs.status === 0){
      scanFiles = gitLs.stdout.split(/\r?\n/).filter(Boolean);
    }
  }catch(e){
    // ignore
  }
}

// Try running npx gitleaks if available; otherwise fallback to regex scan
try{
  const args = ['gitleaks','detect','--source'].concat(scanFiles.length>0?['.']:['.'],'--report-format','json');
  const res = spawnSync('npx', args, { encoding: 'utf8' });
  if (!res.error && res.stdout){
    let out = res.stdout;
    try{
      const findings = JSON.parse(out || '[]');
      const filtered = findings.filter(f=> !wl.includes(f.Evidence));
      if (filtered.length>0){
        console.error('gitleaks found issues:');
        filtered.forEach(f=>{
          console.error(`- ${f.RuleID} in ${f.File} (${f.StartLine}): ${f.Evidence}`)
        });
        process.exit(1);
      }
      console.log('No findings (after whitelist).');
      process.exit(0);
    }catch(e){
      // fallthrough to fallback scan
    }
  }
}catch(err){
  // npx not available or failed — fallback
}

// Fallback: run regex-based scan over files
const findings = fallbackScan(scanFiles);
if (findings.length>0){
  console.error('Found potential secrets (fallback scan):');
  findings.forEach(f=>console.error(`- ${f.pattern} in ${f.file}:${f.line} => ${f.match}`));
  process.exit(1);
}
console.log('No findings (fallback scan).');
process.exit(0);
