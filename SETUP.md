# Quick Setup Guide for HRMS Project

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Git
- Code editor (VS Code recommended)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmanSingh5416/SIH---Orchestrator.git
   cd SIH---Orchestrator
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment file
   copy .env.example .env
   # (On Linux/Mac: cp .env.example .env)
   ```

3. **Configure Environment Variables**
   Edit `backend/.env` file:
   - Keep the `MONGO_URI` as is (shared database)
   - **IMPORTANT**: Change `JWT_SECRET` to a new random string for security
   ```env
   JWT_SECRET=your_unique_secret_key_make_it_random_and_long
   ```

4. **Start Backend Server**
   ```bash
   npm start
   ```
   You should see: `Server running on http://0.0.0.0:5000`

5. **Start Frontend** (new terminal)
   ```bash
   cd ../frontend
   npx serve . -p 3000
   ```
   Or use any static file server

6. **Access the Application**
   - Open browser: `http://localhost:3000`
   - Register a new account or login

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Can register/login (proves DB connection)
- [ ] Can create projects (proves API works)
- [ ] Can join teams (proves full functionality)

## 🐛 Troubleshooting

**Problem**: Can't connect to database
- **Solution**: Check if `MONGO_URI` is correctly copied

**Problem**: API calls fail
- **Solution**: Ensure backend is running on port 5000

**Problem**: CORS errors
- **Solution**: Start frontend from `frontend` directory, not root

**Problem**: Login works but project creation fails
- **Solution**: Make sure you have a different `JWT_SECRET` than the original

## 🔧 Development Mode

For development with auto-restart:
```bash
cd backend
npm install -g nodemon
nodemon server.js
```

## 📞 Need Help?

1. Check browser DevTools → Console for errors
2. Check terminal for backend error messages
3. Verify all environment variables are set correctly