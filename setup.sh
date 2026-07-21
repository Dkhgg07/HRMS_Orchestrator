#!/bin/bash

# HRMS Setup Script
echo "🚀 Setting up HRMS - Human Resource Management System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed"

# Check if we're in the correct directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the HRMS root directory"
    exit 1
fi

echo "📁 Setting up backend..."
cd backend

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Backend dependencies installed successfully"
    else
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
else
    echo "✅ Backend dependencies already installed"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from template..."
    cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=development
EOL
    echo "✅ .env file created. Please update with your MongoDB Atlas credentials."
else
    echo "✅ .env file already exists"
fi

cd ..

echo "🌐 Setting up frontend..."
cd frontend

# Check if serve is available globally
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve globally for frontend..."
    npm install -g serve
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your MongoDB Atlas credentials"
echo "2. Start the backend server:"
echo "   cd backend && npm start"
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend && npx serve ."
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed documentation, see:"
echo "   - README.md (main project)"
echo "   - frontend/README.md (frontend specific)"
echo ""
echo "🐛 Troubleshooting:"
echo "   - Ensure MongoDB Atlas IP whitelist includes your IP"
echo "   - Check that ports 5000 (backend) and 3000 (frontend) are available"
echo "   - See README.md for common issues"
echo ""
echo "Happy coding! 🚀"