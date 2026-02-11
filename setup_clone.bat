@echo off
cd /d "%~dp0"
set GIT_PATH="C:\Program Files\Git\bin\git.exe"

echo ===================================
echo   Cloning Repository...
echo ===================================
%GIT_PATH% clone https://github.com/YVO-Company/yvo____.git

echo ===================================
echo   Done!
echo ===================================
pause
