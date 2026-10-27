@echo off
setlocal
cd /d "%~dp0"

echo.
echo ========================================
echo   CABLE DASHBOARD - ONE CLICK UPDATE
echo ========================================
echo.

echo [1/3] Generating dashboard data...
call npm run generate-data
if errorlevel 1 goto error

echo.
echo [2/3] Checking Git changes...
git status --short
if errorlevel 1 goto error

echo.
echo [3/3] Committing and pushing updates...
git add dashboard-data.json scurve-data.json daily-data.json daily-history.json category-data.json category-history.json
if errorlevel 1 goto error
git diff --cached --quiet
if not errorlevel 1 (
    echo No changes in dashboard data to push.
    goto success
)

git commit -m "Update cable progress dashboard"
if errorlevel 1 goto error

git push
if errorlevel 1 goto error

:success
echo.
echo Update completed successfully.
echo Check Render to confirm deployment is complete.
pause
exit /b 0

:error
echo.
echo UPDATE FAILED. Check the error messages above.
pause
exit /b 1
