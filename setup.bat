@echo off
echo 🚀 Setting up HRMS - Human Resource Management System
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if we're in the correct directory
if not exist "backend" (
    echo ❌ Please run this script from the HRMS root directory
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Please run this script from the HRMS root directory
    pause
    exit /b 1
)

echo 📁 Setting up backend...
cd backend

REM Install backend dependencies
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed successfully
) else (
    echo ✅ Backend dependencies already installed
)

REM Check for .env file
if not exist ".env" (
    echo ⚠️  Creating .env file from template...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms?retryWrites=true^&w=majority
        echo JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
        echo NODE_ENV=development
    ) > .env
    echo ✅ .env file created. Please update with your MongoDB Atlas credentials.
) else (
    echo ✅ .env file already exists
)

cd ..

echo 🌐 Setting up frontend...
cd frontend

REM Check if serve is available globally
npm list -g serve >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing serve globally for frontend...
    npm install -g serve
)

cd ..

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update backend\.env with your MongoDB Atlas credentials
echo 2. Start the backend server:
echo    cd backend ^&^& npm start
echo 3. In a new terminal, start the frontend:
echo    cd frontend ^&^& npx serve .
echo 4. Open http://localhost:3000 in your browser
echo.
echo 📚 For detailed documentation, see:
echo    - README.md (main project)
echo    - frontend\README.md (frontend specific)
echo.
echo 🐛 Troubleshooting:
echo    - Ensure MongoDB Atlas IP whitelist includes your IP
echo    - Check that ports 5000 (backend) and 3000 (frontend) are available
echo    - See README.md for common issues
echo.
echo Happy coding! 🚀
pause