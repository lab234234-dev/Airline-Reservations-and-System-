@echo off
title SkyHigh Air - Project Starter
echo ===================================================
echo ✈️  Starting SkyHigh Air (React + XAMPP PHP + MySQL)
echo ===================================================

echo [1/2] Checking & Starting PHP Backend...
start "SkyHigh PHP Backend" cmd /k "cd php-backend && C:\xampp\php\php.exe -S 127.0.0.1:8000"

timeout /t 2 >nul

echo [2/2] Starting React Client on port 5173...
start "SkyHigh React Client" cmd /k "cd react-client && npm run dev"

timeout /t 2 >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ===================================================
echo ✅ Connected to XAMPP:
echo - React Frontend:  http://localhost:5173
echo - XAMPP Apache:    http://localhost/airline-backend/api
echo - PHP API Server:  http://127.0.0.1:8000/api
echo - MySQL Database:  airline_reservation (Port 3306)
echo ===================================================
pause
