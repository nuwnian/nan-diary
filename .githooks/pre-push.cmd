@echo off
REM Windows pre-push hook wrapper
for /f "delims=" %%f in ('git diff --name-only --staged') do (
  set FILES=%%f %FILES%
)
if "%FILES%"=="" exit /b 0
node "%~dp0secret-scan.js" %FILES%
if errorlevel 1 (
  echo pre-push secret-scan failed
  exit /b 1
)
exit /b 0
