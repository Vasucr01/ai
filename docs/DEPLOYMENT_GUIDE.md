# 🚀 Deployment Guide

Deploy your AI Question Solver to the cloud in minutes!

## Table of Contents
1. [Local Setup](#local-setup)
2. [Deploy Backend](#deploy-backend)
3. [Deploy Frontend](#deploy-frontend)
4. [Connect Frontend & Backend](#connect-frontend--backend)
5. [Troubleshooting](#troubleshooting)

---

## Local Setup

### Prerequisites
- Node.js 16+
- npm 7+
- Git
- Anthropic API Key

### Step 1: Clone Repository
```bash
git clone https://github.com/Vasucr01/ai.git
cd ai
```

### Step 2: Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY
npm run dev
```

### Step 3: Setup Frontend (New Terminal)
```bash
cd frontend
npm install
npm start
```

✅ Open http://localhost:3000

---

## Deploy Backend

### Option 1: Railway (Recommended)

**Step 1: Create Railway Account**
- Visit [railway.app](https://railway.app)
- Sign up with GitHub

**Step 2: Create New Project**
- Click "Create New Project"
- Select "Deploy from GitHub"
- Select your repository

**Step 3: Configure Environment**
- In Railway dashboard, go to Variables
- Add:
  ```
  ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
  PORT=5000
  NODE_ENV=production
  FRONTEND_URL=https://your-domain.vercel.app
  ```

**Step 4: Deploy
- Railway automatically deploys on push
- Get your API URL from the Railway dashboard
- Format: `https://your-app.railway.app`

**Cost:** Free tier with limitations, paid plans from $5/month

---

### Option 2: Render

**Step 1: Create Account**
- Visit [render.com](https://render.com)
- Sign up with GitHub

**Step 2: Create New Service**
- Click "New +"
- Select "Web Service"
- Connect your GitHub repo

**Step 3: Configure**
- Name: `ai-question-solver-backend`
- Environment: `Node`
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`

**Step 4: Add Environment Variables**
- Add `ANTHROPIC_API_KEY`
- Add `FRONTEND_URL`

**Cost:** Free tier with sleep mode, paid from $7/month

---

### Option 3: Heroku (Paid Only)

**Step 1: Install Heroku CLI**
```bash
# Mac
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

**Step 2: Create App**
```bash
heroku create your-app-name
heroku config:set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Step 3: Deploy**
```bash
git push heroku main
```

**Cost:** Paid only ($7-50/month minimum)

---

## Deploy Frontend

### Option 1: Vercel (Recommended)

**Step 1: Create Account**
- Visit [vercel.com](https://vercel.com)
- Sign up with GitHub

**Step 2: Import Project**
- Click "Add New"
- Select "Project"
- Select your GitHub repository

**Step 3: Configure**
- Framework Preset: `Create React App`
- Root Directory: `frontend`
- Environment Variables:
  ```
  REACT_APP_API_URL=https://your-app.railway.app/api
  REACT_APP_ENV=production
  ```

**Step 4: Deploy**
- Click "Deploy"
- Vercel automatically deploys on push
- Your site is live!

**Cost:** Free tier included

---

### Option 2: Netlify

**Step 1: Create Account**
- Visit [netlify.com](https://netlify.com)
- Sign up with GitHub

**Step 2: New Site**
- Click "Add new site"
- Select "Import an existing project"
- Choose your GitHub repo

**Step 3: Configure**
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `build`

**Step 4: Environment Variables**
- Go to Site Settings → Build & Deploy → Environment
- Add `REACT_APP_API_URL=https://your-api.railway.app/api`

**Step 5: Deploy**
- Click "Deploy site"

**Cost:** Free tier available

---

### Option 3: AWS Amplify

**Step 1: Create Account**
- Visit [aws.amazon.com](https://aws.amazon.com)
- Create free account

**Step 2: Connect GitHub**
- AWS Amplify → New App → Host web app
- Select GitHub provider
- Authorize and select your repo

**Step 3: Configure Build Settings**
- Frontend: `frontend`
- Build command: `npm run build`
- Output: `build`

**Step 4: Add Environment Variables**
- `REACT_APP_API_URL=https://your-api-url/api`

**Step 5: Deploy**
- Click "Save and deploy"

**Cost:** Free tier, pay as you go after

---

## Connect Frontend & Backend

### Update Frontend Environment

After deploying backend, update frontend environment:

**Vercel:**
1. Go to project Settings
2. Environment Variables
3. Update `REACT_APP_API_URL` to your deployed backend URL
4. Redeploy

**Example:**
```
REACT_APP_API_URL=https://ai-solver-backend.railway.app/api
```

### Update Backend CORS

Update `FRONTEND_URL` in backend environment:

**Railway/Render:**
1. Go to project Variables
2. Update `FRONTEND_URL` to your deployed frontend URL
3. Service redeploys automatically

**Example:**
```
FRONTEND_URL=https://ai-solver-frontend.vercel.app
```

---

## Domain Setup

### Add Custom Domain (Vercel)

**Step 1: Buy Domain**
- Buy from GoDaddy, Namecheap, or Route53

**Step 2: Add to Vercel**
- Project Settings → Domains
- Add your domain

**Step 3: Update DNS**
- Go to your domain registrar
- Update nameservers to Vercel's:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ```

**Verification:** 24-48 hours

---

## SSL/HTTPS

✅ Automatically enabled on:
- Vercel
- Railway
- Render
- Netlify
- AWS Amplify

All services provide free SSL certificates!

---

## Monitoring & Logs

### Railway
- Dashboard → Logs
- Real-time error tracking

### Render
- Service Logs
- Deployment history

### Vercel
- Analytics
- Performance metrics
- Error tracking

### Netlify
- Site Analytics
- Deploy log

---

## Performance Optimization

### Frontend
1. **Code Splitting:**
   ```bash
   npm run build
   ```

2. **Image Optimization:**
   - Use SVG for icons
   - Compress images

3. **Caching:**
   - Vercel CDN enabled by default

### Backend
1. **Response Caching:**
   ```javascript
   app.use(express.static('public', { maxAge: '1d' }));
   ```

2. **Request Compression:**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

---

## Database (Optional)

### MongoDB Atlas

**Step 1: Create Account**
- Visit [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Sign up free

**Step 2: Create Cluster**
- Create M0 Sandbox cluster
- Create user and password
- Get connection string

**Step 3: Add to Backend**
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
```

**Step 4: Connect in Code**
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

---

## Security Best Practices

✅ **Do:**
- Use environment variables for secrets
- Enable HTTPS (automatic on all platforms)
- Validate all inputs
- Set rate limiting
- Use CORS properly

❌ **Don't:**
- Commit API keys to GitHub
- Use weak API keys
- Disable HTTPS
- Allow unlimited file uploads
- Trust client-side validation

---

## Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway Backend | $5 credit | $5-50/month |
| Vercel Frontend | Unlimited | $20+/month |
| Netlify Frontend | Unlimited | $19+/month |
| MongoDB | Free (512MB) | $57+/month |
| **Total** | ~$10 credits | $82-137/month |

**Budget Tip:** Start free, upgrade as needed!

---

## Troubleshooting

### "CORS Error"
**Solution:**
1. Check `FRONTEND_URL` in backend environment
2. Ensure it matches your frontend URL exactly
3. Redeploy backend

### "API Key Invalid"
**Solution:**
1. Get new key from console.anthropic.com
2. Update backend environment variable
3. Redeploy backend

### "Build Fails"
**Solution:**
1. Check build logs
2. Verify Node.js version compatibility
3. Try local build: `npm run build`

### "Slow Performance"
**Solution:**
1. Check API response time
2. Enable caching
3. Upgrade backend plan
4. Use CDN (Vercel/Netlify default)

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy frontend to Vercel
3. ✅ Connect frontend to backend
4. ✅ Add custom domain
5. ✅ Monitor performance
6. ✅ Share with the world!

---

**Deployment Complete! 🎉**

Your AI Question Solver is now live and accessible to the world!

**Check:**
- Frontend: `https://your-domain.vercel.app`
- Backend: `https://your-app.railway.app/api/health`

---

**Last Updated:** May 2026
**Status:** Production Ready ✅
