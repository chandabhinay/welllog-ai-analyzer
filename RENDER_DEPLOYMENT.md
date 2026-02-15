# Deployment Configuration

## Vercel (Frontend)

**URL**: https://welllog-ai-analyzer.vercel.app/

### Environment Variables
```
VITE_API_URL=https://welllog-ai-analyzer.onrender.com/api
```

---

## Render (Backend)

**URL**: https://welllog-ai-analyzer.onrender.com/

### Required Environment Variables in Render Dashboard:

1. **Database Configuration**
   - `DB_HOST` - PostgreSQL host (from Render database)
   - `DB_PORT` - 5432
   - `DB_NAME` - welllog_db
   - `DB_USER` - welllog_admin
   - `DB_PASSWORD` - (your database password)

2. **AWS S3 Configuration**
   - `AWS_REGION` - us-east-1
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
   - `S3_BUCKET_NAME` - Your S3 bucket name

3. **API Configuration**
   - `NODE_ENV` - production
   - `PORT` - 5000
   - `GEMINI_API_KEY` - Your Gemini API key
   - `FRONTEND_URL` - https://welllog-ai-analyzer.vercel.app

---

## How to Set Environment Variables on Render

1. Go to your backend service on Render
2. Click "Environment" in the left sidebar
3. Add each environment variable in the "Environment Variables" section
4. Click "Deploy" to apply the changes

---

## Deployment Steps

### 1. Update and Push Changes
```bash
git add .
git commit -m "Update deployment config for Vercel and Render"
git push origin main
```

### 2. Configure Render Backend
- Go to Render Dashboard
- Select your backend service
- Go to "Environment" tab
- Add all required environment variables (see above)
- Click "Manual Deploy" to redeploy

### 3. Verify Deployment
- Frontend: https://welllog-ai-analyzer.vercel.app/
- Backend API: https://welllog-ai-analyzer.onrender.com/api/health
- Try uploading a LAS file to test end-to-end

