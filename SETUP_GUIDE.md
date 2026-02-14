# Step-by-Step Setup Guide

This guide will walk you through setting up the Well Log Analysis System from scratch.

## Prerequisites Installation

### 1. Install Node.js

**Windows:**
1. Download from https://nodejs.org/ (LTS version recommended)
2. Run installer
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer (note the password you set)
3. Ensure PostgreSQL service is running

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Verify PostgreSQL Installation

```bash
psql --version
```

## Database Setup

### 1. Create Database

**Windows (PowerShell):**
```powershell
# Login to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE welllog_db;
\q
```

**macOS/Linux:**
```bash
# Login as postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE welllog_db;
\q
```

### 2. Create User (Optional but Recommended)

```sql
CREATE USER welllog_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE welllog_db TO welllog_user;
```

## AWS S3 Setup

### 1. Create AWS Account
- Go to https://aws.amazon.com/
- Sign up for free tier

### 2. Create S3 Bucket
1. Go to AWS Console → S3
2. Click "Create bucket"
3. Bucket name: `welllog-files-[your-name]` (must be unique)
4. Region: Choose closest region (e.g., us-east-1)
5. Block all public access: Keep enabled
6. Create bucket

### 3. Create IAM User for S3 Access
1. AWS Console → IAM → Users
2. Add user: `welllog-app`
3. Access type: Programmatic access
4. Attach policies: `AmazonS3FullAccess` (or create custom policy)
5. Save Access Key ID and Secret Access Key

### Example S3 IAM Policy (More Restrictive):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## OpenAI API Setup

### 1. Get API Key
1. Go to https://platform.openai.com/
2. Sign up or login
3. Go to API keys section
4. Create new secret key
5. Copy and save the key (shown only once)

### 2. Check Credits
- Ensure you have credits or set up billing
- Free tier includes limited credits

## Project Setup

### 1. Clone/Download Project

If you have the code:
```bash
cd Assignment_One_Geo
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env  # Windows
# or
cp .env.example .env    # macOS/Linux
```

### 3. Configure Backend Environment

Edit `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=welllog-files-yourname

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=welllog_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace all example values with your actual credentials!

### 4. Initialize Database

```bash
npm run init-db
```

Expected output:
```
Testing database connection...
Database connection established successfully.
Synchronizing database schema...
Database initialized successfully!
```

### 5. Start Backend Server

```bash
npm run dev
```

Expected output:
```
Server running on port 5000
Environment: development
Database connection established successfully.
```

Leave this terminal running.

### 6. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Verify Installation

### 1. Open Application
- Navigate to http://localhost:5173
- You should see the home page

### 2. Test Backend API
Open browser to http://localhost:5000/api/health

Expected response:
```json
{
  "status": "ok",
  "message": "Well Log API is running"
}
```

### 3. Upload Test File
1. Click "Upload LAS File"
2. Select the provided `Well_Data (las).las` file
3. Wait for processing (may take 30-60 seconds)
4. You should see success message

### 4. Test Visualization
1. Click "View" on the uploaded well
2. Select curves (e.g., HC1, HC2, TOTAL_GAS)
3. Click "Visualize"
4. Chart should display

### 5. Test AI Features
1. Switch to "AI Interpretation" tab
2. Select curves and depth range
3. Click "Interpret"
4. Wait for AI response (requires OpenAI API key)

## Troubleshooting

### Backend Won't Start

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000
# Kill process or change PORT in .env

# macOS/Linux
lsof -ti:5000 | xargs kill
```

**Database connection error:**
- Verify PostgreSQL is running
- Check credentials in .env
- Ensure database exists
- Check firewall settings

### Frontend Won't Start

**Port 5173 in use:**
```bash
# Change port in vite.config.js
server: {
  port: 3000  // or another port
}
```

**Module not found errors:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Database Connection Issues

**Can't connect to PostgreSQL:**
```bash
# Check if PostgreSQL is running
# Windows
sc query postgresql-x64-14  # version may vary

# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

**Password authentication failed:**
- Verify password in .env
- Check pg_hba.conf for authentication method
- Try connecting with psql to verify credentials

### S3 Upload Fails

**Credentials error:**
- Double-check AWS credentials
- Ensure no extra spaces in .env
- Verify IAM user has S3 permissions

**Bucket not found:**
- Verify bucket name is correct
- Check region matches
- Ensure bucket exists in your AWS account

### OpenAI API Errors

**Invalid API key:**
- Verify key is correct
- Ensure no spaces or newlines
- Check if key is still active

**Rate limit exceeded:**
- Wait a few minutes
- Check your API usage
- Application will use fallback if API fails

### Upload Processing Slow

**Large file:**
- First upload takes longer (parsing + database inserts)
- Be patient, it can take 1-2 minutes for large files
- Check browser console for progress

## Next Steps

### 1. Exploring the Application
- Upload different LAS files
- Try various curve combinations
- Use different depth ranges
- Ask chatbot questions

### 2. Customization
- Modify color schemes in frontend
- Add new API endpoints
- Customize AI prompts
- Add new features

### 3. Production Deployment
- See DEPLOYMENT.md for production setup
- Configure production database
- Set up SSL/HTTPS
- Use environment-specific configs

## Getting Help

### Check Logs

**Backend logs:**
- Terminal where `npm run dev` is running
- Check for errors and stack traces

**Frontend logs:**
- Browser developer console (F12)
- Network tab for API calls
- Console tab for JavaScript errors

**Database logs:**
- PostgreSQL logs (location varies by OS)
- Check query errors

### Common Issues

1. **CORS errors**: Check FRONTEND_URL in backend .env
2. **API not responding**: Verify backend is running
3. **Charts not rendering**: Check browser console, ensure Plotly is loaded
4. **Database errors**: Check PostgreSQL logs

### Resources

- PostgreSQL: https://www.postgresql.org/docs/
- Node.js: https://nodejs.org/docs/
- React: https://react.dev/
- Material-UI: https://mui.com/
- Plotly: https://plotly.com/javascript/

## Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Node.js and npm installed
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] Database initialized
- [ ] Backend server running
- [ ] Frontend dependencies installed
- [ ] Frontend server running
- [ ] Application accessible in browser
- [ ] Test file uploaded successfully
- [ ] Visualization working
- [ ] AI interpretation working (with API key)
- [ ] Chatbot responding

Congratulations! Your Well Log Analysis System is now running! 🎉
