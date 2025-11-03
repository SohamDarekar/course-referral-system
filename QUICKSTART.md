# 🚀 Quick Start Guide

Get the Course Store referral system up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account

## Setup Steps

### 1. Install Dependencies

```bash
npm install
npm run install:all
```

### 2. Configure Environment

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` - Update `MONGO_URI` if needed:
```env
MONGO_URI=mongodb://localhost:27017/course-store
JWT_SECRET=change_this_secret
FRONTEND_URL=http://localhost:3000
```

**Frontend:**
```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXTAUTH_SECRET=change_this_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Seed Database

```bash
cd ../backend
npm run seed
```

### 4. Start Servers

**From root directory:**
```bash
npm run dev
```

**Or start individually:**

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
cd frontend && npm run dev
```

### 5. Test the Application

1. Open http://localhost:3000
2. Register as User A (e.g., lina@test.com)
3. Go to Dashboard and copy your referral link
4. Logout
5. Open the referral link in a new incognito window
6. Register as User B (e.g., ryan@test.com)
7. Login as User B and purchase a course
8. Check both dashboards - both users should have 2 credits!

## Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running: `brew services start mongodb-community` (Mac)
- Or use MongoDB Atlas and update `MONGO_URI`

**Port Already in Use:**
- Change `PORT` in backend/.env (default: 5000)
- Change port in frontend/.env.local's `NEXT_PUBLIC_API_URL`

**CORS Errors:**
- Verify `FRONTEND_URL` in backend/.env matches your frontend URL

## Need Help?

Check the main [README.md](./README.md) for comprehensive documentation.
