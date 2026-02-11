@echo off
cd /d "%~dp0"
set GIT_PATH="C:\Program Files\Git\bin\git.exe"

echo ===================================
echo   WARNING: Fresh Reset for yvo____
echo   Deleting .git folder to start fresh...
echo ===================================
if exist .git (
    rmdir /s /q .git
)

echo ===================================
echo   Initializing Fresh Repository...
echo ===================================
%GIT_PATH% init
%GIT_PATH% branch -M main

echo ===================================
echo   Adding ALL files...
echo ===================================
%GIT_PATH% add .

echo ===================================
echo   Committing changes...
echo ===================================
%GIT_PATH% commit -m "Fresh Start: Overwriting yvo____ repository"

echo ===================================
echo   Configuring Remote Repository...
echo ===================================
%GIT_PATH% remote add origin https://github.com/YVO-Company/yvo____.git

echo ===================================
echo   Pushing to GitHub (Force Overwrite)...
echo ===================================
%GIT_PATH% push -u origin main --force

echo ===================================
echo   Done! Your yvo____ repo is updated.
echo ===================================
pause
