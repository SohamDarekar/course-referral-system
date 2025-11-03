# 🔧 Troubleshooting Guide

Common issues and their solutions.

## Installation Issues

### ❌ `npm install` fails

**Problem:** Dependencies won't install

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try different Node version (use nvm)
nvm install 18
nvm use 18
npm install
```

### ❌ `command not found: npm`

**Problem:** Node.js not installed

**Solution:**
```bash
# Install Node.js (Mac)
brew install node

# Install Node.js (Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

## Database Issues

### ❌ MongoDB connection failed

**Problem:** `MongooseError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**

**Option 1: Start local MongoDB**
```bash
# Mac
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Verify it's running
mongo --eval "db.version()"
```

**Option 2: Use MongoDB Atlas**
1. Create free cluster at mongodb.com/cloud/atlas
2. Get connection string
3. Update `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/course-store
   ```

### ❌ Authentication failed (MongoDB)

**Problem:** `MongoServerError: Authentication failed`

**Solution:**
```bash
# Check MongoDB Atlas:
# 1. Verify username/password
# 2. Check IP whitelist (allow 0.0.0.0/0 for development)
# 3. Ensure user has read/write permissions
```

### ❌ Database not seeded

**Problem:** Courses don't appear in frontend

**Solution:**
```bash
cd backend
npm run seed

# Should see:
# ✅ MongoDB connected successfully
# ✅ Cleared existing courses
# ✅ Seeded 5 courses
```

## Backend Issues

### ❌ Port 5000 already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**

**Option 1: Kill process on port 5000**
```bash
# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Option 2: Change port**
```bash
# backend/.env
PORT=5001

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### ❌ JWT secret error

**Problem:** `JWT must be provided`

**Solution:**
```bash
# backend/.env
JWT_SECRET=your_super_secret_at_least_32_characters_long

# Generate secure secret:
openssl rand -base64 32
```

### ❌ CORS errors

**Problem:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions:**
```bash
# 1. Check backend/.env
FRONTEND_URL=http://localhost:3000

# 2. Restart backend server
cd backend && npm run dev

# 3. Verify frontend URL matches
# frontend/.env.local should have:
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### ❌ TypeScript compilation errors

**Problem:** `TS2304: Cannot find name 'process'`

**Solution:**
```bash
# Install @types/node
cd backend
npm install --save-dev @types/node

# Or rebuild
npm run build
```

## Frontend Issues

### ❌ NextAuth errors

**Problem:** `[next-auth][error][CLIENT_FETCH_ERROR]`

**Solutions:**

**Check environment variables:**
```bash
# frontend/.env.local must have:
NEXTAUTH_SECRET=your_secret_at_least_32_chars
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000

# Generate NEXTAUTH_SECRET:
openssl rand -base64 32
```

**Verify backend is running:**
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","message":"Server is running"}
```

### ❌ `useSession` returns null

**Problem:** Session is always null

**Solution:**
```typescript
// Wrap app in AuthProvider (already done in layout.tsx)
// frontend/src/app/layout.tsx
import { AuthProvider } from '@/components/providers/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### ❌ Module not found errors

**Problem:** `Cannot find module '@/...'`

**Solution:**
```bash
# Check tsconfig.json has paths configured:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Restart Next.js dev server
npm run dev
```

### ❌ Tailwind classes not working

**Problem:** Styles not applying

**Solutions:**

**1. Check tailwind.config.js:**
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ...
}
```

**2. Verify globals.css imports:**
```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**3. Restart dev server:**
```bash
npm run dev
```

### ❌ `localhost:3000` doesn't load

**Problem:** Page not found or blank screen

**Solutions:**
```bash
# 1. Clear .next cache
rm -rf .next

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Restart server
npm run dev

# 4. Check console for errors
# Open browser DevTools (F12) → Console tab
```

## Authentication Issues

### ❌ Can't register user

**Problem:** Registration fails with 500 error

**Check:**
1. MongoDB is running
2. Backend .env has correct MONGO_URI
3. No duplicate username/email exists

**Test with curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### ❌ Login redirects to callback error

**Problem:** NextAuth callback error after login

**Solution:**
```bash
# Check frontend/.env.local
NEXTAUTH_URL=http://localhost:3000  # Must match your domain

# Restart Next.js
npm run dev
```

### ❌ Token expired errors

**Problem:** `Invalid or expired token`

**Solution:**
```typescript
// Login again to get fresh token
// JWT expires after 7 days (configured in backend)

// Or increase expiry in backend/src/controllers/authController.ts:
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '30d' } // Changed from 7d to 30d
);
```

## Referral System Issues

### ❌ Referral code not in URL

**Problem:** `?r=CODE` not appearing

**Solution:**
```typescript
// Check frontend/src/app/dashboard/page.tsx
const referralLink = `${frontendUrl}/register?r=${user.referralCode}`;

// Ensure NEXT_PUBLIC_API_URL or window.location.origin is correct
```

### ❌ Credits not awarded

**Problem:** Purchase succeeds but no credits

**Debugging steps:**

**1. Check user hasConverted flag:**
```bash
# Connect to MongoDB
mongo

# Or MongoDB Atlas
# Use MongoDB Compass or Atlas UI

# Query user
use course-store
db.users.find({ email: "ryan@example.com" })

# Should see:
# { ..., hasConverted: false, referredBy: ObjectId(...) }
```

**2. Check backend logs:**
```bash
# backend terminal should show:
# POST /api/courses/:id/purchase
# No errors
```

**3. Test with curl:**
```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ryan@test.com","password":"pass123"}' \
  | jq -r '.token')

# Purchase course
curl -X POST http://localhost:5000/api/courses/COURSE_ID/purchase \
  -H "Authorization: Bearer $TOKEN"

# Should return:
# {"creditsEarned": 2, "userCredits": 2, "referrerCredited": true}
```

### ❌ Credits awarded twice

**Problem:** User gets credits on every purchase

**This should NOT happen if:**
- `hasConverted` flag is working
- MongoDB transactions are enabled

**Check:**
```javascript
// backend/src/controllers/dashboardController.ts
if (!user.hasConverted) {
  user.hasConverted = true;  // This MUST be set
  // ... award credits
}
```

## Development Issues

### ❌ Hot reload not working

**Problem:** Changes don't reflect automatically

**Solutions:**
```bash
# Backend (nodemon)
# Check backend/package.json:
"dev": "nodemon src/server.ts"

# Restart
npm run dev

# Frontend (Next.js)
# Delete .next folder
rm -rf .next
npm run dev
```

### ❌ Environment variables not loading

**Problem:** `process.env.VARIABLE` is undefined

**Solutions:**

**Backend:**
```typescript
// Must import dotenv at top of server.ts
import dotenv from 'dotenv';
dotenv.config();

// Restart server after .env changes
```

**Frontend:**
```bash
# Variables must start with NEXT_PUBLIC_ for client-side
NEXT_PUBLIC_API_URL=http://localhost:5000

# Restart Next.js after .env.local changes
npm run dev
```

## Production Issues

### ❌ Build fails

**Problem:** `npm run build` errors

**Solutions:**
```bash
# Backend
cd backend
rm -rf dist node_modules
npm install
npm run build

# Frontend
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### ❌ Deployed app can't connect to API

**Problem:** CORS errors in production

**Check:**
```bash
# Backend .env (production)
FRONTEND_URL=https://your-app.vercel.app  # Exact domain

# Frontend .env (production)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app  # Exact domain
```

## Getting Help

### Check Logs

**Backend logs:**
```bash
# Development
cd backend && npm run dev
# Watch terminal output

# Production (Railway)
railway logs

# Production (Heroku)
heroku logs --tail
```

**Frontend logs:**
```bash
# Development
cd frontend && npm run dev
# Watch terminal output

# Production (Vercel)
# Check Vercel dashboard → Deployments → View Logs
```

### Debug Checklist

- [ ] MongoDB is running/connected
- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 3000)
- [ ] .env files are configured
- [ ] All dependencies installed
- [ ] Database is seeded
- [ ] No TypeScript errors
- [ ] Browser console has no errors
- [ ] Network tab shows successful API calls

### Still Stuck?

1. **Check browser console** (F12 → Console)
2. **Check Network tab** (F12 → Network)
3. **Review backend terminal** for error logs
4. **Test API with curl** (see API_TESTING.md)
5. **Compare with working examples** in documentation
6. **Read error messages carefully** (they usually tell you the issue)

### Common Error Patterns

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| ECONNREFUSED | Service not running | Start the service |
| EADDRINUSE | Port already in use | Kill process or change port |
| 401 Unauthorized | Missing/invalid token | Re-login to get new token |
| 404 Not Found | Wrong URL or route | Check API path |
| 500 Server Error | Backend crash | Check backend logs |
| CORS error | CORS misconfiguration | Check FRONTEND_URL setting |
| Validation error | Invalid input | Check Zod schema requirements |

---

## 🎯 Quick Fixes

**Everything broken? Nuclear option:**
```bash
# Stop all servers (Ctrl+C)

# Clean everything
rm -rf backend/node_modules backend/dist
rm -rf frontend/node_modules frontend/.next
rm backend/.env frontend/.env.local

# Fresh install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit .env files with correct values

npm run install:all
cd backend && npm run seed

# Start from root
cd ..
npm run dev
```

**Still not working? Check:**
1. Node.js version: `node --version` (should be 18+)
2. MongoDB running: `mongo --eval "db.version()"`
3. Ports free: `lsof -ti:5000 && lsof -ti:3000`

---

**Most issues are environment-related. Double-check your .env files!** 🔑
