#!/usr/bin/env node
// Wrapper to run gitleaks (via npx) and filter results using .secrets-whitelist
const { spawnSync } = require('child_process');
const fs = require('fs');

function loadWhitelist(){
  const p = '.secrets-whitelist';
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p,'utf8').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
}

const wl = loadWhitelist();

// Run gitleaks detect
const args = ['gitleaks','detect','--source','.', '--report-format','json'];
const res = spawnSync('npx', args, { encoding: 'utf8' });
if (res.error){
  console.error('Failed to run npx gitleaks:', res.error);
  process.exit(2);
}
if (res.status !== 0 && !res.stdout){
  // gitleaks usually exits 1 when it finds leaks but outputs stdout
}
let out = res.stdout || '';
try{
  const findings = JSON.parse(out || '[]');
  const filtered = findings.filter(f=>{
    // if the evidence exactly matches a whitelist entry, ignore
    return !wl.includes(f.Evidence);
  });
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
  console.error('Failed to parse gitleaks output');
  console.error(out);
  process.exit(2);
}
