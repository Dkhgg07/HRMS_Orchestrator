@echo off
echo Starting HRMS Frontend Server on port 3000...
cd /d "d:\Aarjav\Coding\Projects\Web\HRMS\frontend"
npx http-server . -p 3000 -c-1 --cors -o
pause