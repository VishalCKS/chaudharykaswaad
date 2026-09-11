@echo off
title Chaudhary Almond Slice Cookies 4K Animation Player
echo ======================================================================
echo   Launching Chaudhary Almond Slice Cookies 4K Animation Player...
echo   Opening http://localhost:8080 and http://localhost:3000...
echo ======================================================================

start http://localhost:8080

if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    "%LOCALAPPDATA%\Programs\nodejs\node.exe" server.js
) else (
    node server.js
)

pause
