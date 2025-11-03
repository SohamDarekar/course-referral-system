# 🚀 Deployment Guide

This guide covers deploying the Course Store application to production.

## Prerequisites

- Git repository (GitHub, GitLab, etc.)
- MongoDB Atlas account (free tier available)
- Vercel account (for frontend)
- Railway/Render/Heroku account (for backend)

## Part 1: MongoDB Atlas Setup

### 1. Create Database

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) or specific IPs
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/course-store?retryWrites=true&w=majority
   ```

### 2. Seed Production Database

```bash
# Update backend/.env with Atlas URI
MONGO_URI=mongodb+srv://...

# Run seed script
cd backend
npm run seed
```

## Part 2: Backend Deployment (Railway)

### Option A: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project:**
   ```bash
   cd backend
   railway init
   ```

3. **Set Environment Variables:**
   ```bash
   railway variables set MONGO_URI="your_atlas_uri"
   railway variables set JWT_SECRET="your_secret_here"
   railway variables set NODE_ENV="production"
   railway variables set FRONTEND_URL="https://your-frontend.vercel.app"
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Get Backend URL:**
   ```bash
   railway domain
   # Example: https://course-store-backend-production.up.railway.app
   ```

### Option B: Deploy to Render

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your repository
4. Configure:
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:**
     ```
     MONGO_URI=your_atlas_uri
     JWT_SECRET=your_secret
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend.vercel.app
     PORT=10000
     ```

### Option C: Deploy to Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create App:**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set MONGO_URI="your_atlas_uri"
   heroku config:set JWT_SECRET="your_secret"
   heroku config:set NODE_ENV="production"
   heroku config:set FRONTEND_URL="https://your-frontend.vercel.app"
   ```

4. **Add Procfile:**
   ```bash
   echo "web: npm run build && npm start" > Procfile
   ```

5. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## Part 3: Frontend Deployment (Vercel)

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
vercel login
```

### 2. Deploy via Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### 3. Set Environment Variables

In Vercel dashboard:

```env
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Important:** Generate strong secrets:
```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32
```

### 4. Deploy

Click "Deploy" - Vercel will automatically build and deploy.

### 5. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` with new domain

## Part 4: Environment Variables Summary

### Backend Production Variables

```env
PORT=10000  # or Railway/Heroku auto-assigned
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/course-store
JWT_SECRET=your_super_long_random_secret_at_least_32_chars
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend Production Variables

```env
NEXTAUTH_SECRET=your_super_long_random_secret_at_least_32_chars
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## Part 5: Post-Deployment Checklist

### ✅ Verification Steps

1. **Backend Health Check:**
   ```bash
   curl https://your-backend.railway.app/health
   # Should return: {"status":"OK","message":"Server is running"}
   ```

2. **Test Registration:**
   - Go to https://your-app.vercel.app/register
   - Create a test account
   - Verify in MongoDB Atlas that user was created

3. **Test Login:**
   - Login with test account
   - Verify JWT token in browser DevTools

4. **Test Referral Flow:**
   - Register User A
   - Copy referral link from dashboard
   - Logout
   - Register User B with referral link
   - Login as User B and purchase course
   - Verify both users have credits

5. **Check CORS:**
   - Open browser console
   - Look for CORS errors
   - If errors, verify `FRONTEND_URL` in backend

### 🔒 Security Checks

- [ ] `.env` files not committed to Git
- [ ] Strong JWT_SECRET (32+ random characters)
- [ ] Strong NEXTAUTH_SECRET (32+ random characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] CORS restricted to frontend URL
- [ ] HTTPS enabled on both frontend and backend

### 📊 Monitoring Setup

1. **Vercel Analytics:**
   - Enable in Project Settings → Analytics

2. **Railway/Render Logs:**
   ```bash
   railway logs  # For Railway
   # Or check Render dashboard
   ```

3. **MongoDB Atlas Monitoring:**
   - Check cluster metrics in Atlas dashboard

4. **Error Tracking (Optional):**
   ```bash
   # Add Sentry
   npm install @sentry/nextjs @sentry/node
   ```

## Part 6: CI/CD Setup

### GitHub Actions (Automatic Deployment)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## Part 7: Rollback Strategy

### Backend Rollback

**Railway:**
```bash
railway rollback
```

**Heroku:**
```bash
heroku releases
heroku rollback v123
```

**Render:**
- Use dashboard to select previous deployment

### Frontend Rollback

**Vercel:**
1. Go to Deployments
2. Find previous deployment
3. Click "..." → "Promote to Production"

## Part 8: Scaling Strategies

### Vertical Scaling

**Backend:**
- Railway: Upgrade to higher plan
- Render: Change instance type
- Heroku: `heroku ps:scale web=2`

**Database:**
- MongoDB Atlas: Upgrade cluster tier

### Horizontal Scaling

**Backend:**
- Add load balancer (Railway/Render automatic)
- Multiple instances handle concurrent requests
- Stateless JWT authentication = easy scaling

**Frontend:**
- Vercel automatically distributes to CDN
- Edge functions for regional performance

**Database:**
- Enable MongoDB replica set
- Add read replicas for queries

## Part 9: Cost Estimation

### Free Tier Setup

- **MongoDB Atlas:** 512 MB free
- **Railway:** $5/month credit (first month free)
- **Vercel:** Unlimited deployments (fair use)
- **Total:** ~$5/month after free trials

### Production Setup

- **MongoDB Atlas M10:** ~$50/month
- **Railway Pro:** ~$20/month
- **Vercel Pro:** ~$20/month
- **Total:** ~$90/month

## Part 10: Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor response times
- Review database size

**Monthly:**
- Update dependencies: `npm update`
- Review security advisories: `npm audit`
- Check MongoDB Atlas metrics

**Quarterly:**
- Database backup verification
- Load testing
- Security audit

### Backup Strategy

**Database Backup:**
```bash
# MongoDB Atlas automatic backups (enabled by default)
# Or manual backup:
mongodump --uri="your_atlas_uri" --out=./backup
```

**Code Backup:**
- Git repository (primary)
- GitHub/GitLab (remote)
- Local clones (developer machines)

## Support

**Issues?**
- Check application logs
- Review environment variables
- Test with curl/Postman
- Check MongoDB Atlas connectivity

**Performance Issues?**
- Enable MongoDB slow query log
- Add database indexes
- Use Redis caching
- Optimize frontend bundle size

---

**Deployment Checklist Complete! 🎉**

Your Course Store is now live and ready for users!
