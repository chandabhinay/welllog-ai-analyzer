# Deployment Guide

This guide covers deploying the Well Log Analysis System to production.

## Overview

The application consists of three main components:
1. **Frontend** - Static React application
2. **Backend** - Node.js API server
3. **Database** - PostgreSQL database

## Deployment Options

### Option 1: AWS (Recommended for Production)

#### Components:
- **Frontend**: AWS S3 + CloudFront
- **Backend**: AWS Elastic Beanstalk or EC2
- **Database**: AWS RDS PostgreSQL
- **File Storage**: AWS S3

#### Cost Estimate (Monthly):
- RDS db.t3.micro: ~$15-20
- Elastic Beanstalk t2.micro: Free tier / ~$10
- S3 storage: ~$1-5
- CloudFront: Pay per use (~$1-10)
- **Total**: ~$30-50/month

---

## AWS Deployment

### 1. Database Setup (AWS RDS)

#### Create RDS PostgreSQL Instance:

1. **AWS Console → RDS → Create Database**
2. Configuration:
   - Engine: PostgreSQL 14+
   - Template: Free tier (for testing) or Production
   - DB instance identifier: `welllog-db`
   - Master username: `welllog_admin`
   - Master password: [Strong password]
   - Instance class: `db.t3.micro` (free tier eligible)
   - Storage: 20 GB SSD
   - VPC: Default or custom
   - Public access: Yes (or use VPC peering)
   - Security group: Create new or use existing

3. **Security Group Rules:**
   - Inbound: PostgreSQL (5432) from backend security group
   - Or temporarily: 0.0.0.0/0 (not recommended for production)

4. **Note down:**
   - Endpoint URL
   - Port (default 5432)
   - Database name
   - Master username
   - Password

#### Initialize Database:

```bash
# Connect to RDS
psql -h your-rds-endpoint.rds.amazonaws.com -U welllog_admin -d postgres

# Create database
CREATE DATABASE welllog_db;

# Exit
\q

# Run initialization from local machine
# Update backend/.env with RDS credentials
cd backend
npm run init-db
```

### 2. File Storage (S3 Bucket)

Already covered in SETUP_GUIDE.md, but ensure:
- Bucket created with appropriate name
- IAM user/role with S3 permissions
- CORS configured if needed

### 3. Backend Deployment (Elastic Beanstalk)

#### Install EB CLI:

```bash
pip install awsebcli
```

#### Initialize and Deploy:

```bash
cd backend

# Initialize EB application
eb init -p node.js-16 welllog-api --region us-east-1

# Create environment
eb create welllog-api-prod

# Configure environment variables
eb setenv \
  NODE_ENV=production \
  DB_HOST=your-rds-endpoint.rds.amazonaws.com \
  DB_PORT=5432 \
  DB_NAME=welllog_db \
  DB_USER=welllog_admin \
  DB_PASSWORD=your_password \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID=your_key \
  AWS_SECRET_ACCESS_KEY=your_secret \
  S3_BUCKET_NAME=your_bucket \
  OPENAI_API_KEY=your_key \
  FRONTEND_URL=https://your-frontend-domain.com

# Deploy
eb deploy

# Check status
eb status

# View logs
eb logs
```

#### Alternative: EC2 with PM2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd Assignment_One_Geo/backend

# Install dependencies
npm install

# Create .env with production values
nano .env

# Start with PM2
pm2 start server.js --name welllog-api
pm2 startup
pm2 save

# Configure nginx as reverse proxy
sudo yum install nginx
sudo nano /etc/nginx/nginx.conf
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Frontend Deployment (S3 + CloudFront)

#### Build Frontend:

```bash
cd frontend

# Update API URL for production
echo "VITE_API_URL=https://your-api-domain.com/api" > .env.production

# Build
npm run build
```

#### Deploy to S3:

```bash
# Create S3 bucket for frontend
aws s3 mb s3://welllog-frontend

# Configure for static website hosting
aws s3 website s3://welllog-frontend \
  --index-document index.html \
  --error-document index.html

# Upload build
aws s3 sync dist/ s3://welllog-frontend --delete

# Set bucket policy
aws s3api put-bucket-policy --bucket welllog-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::welllog-frontend/*"
  }]
}'
```

#### Setup CloudFront (Optional but Recommended):

1. **AWS Console → CloudFront → Create Distribution**
2. Origin domain: `welllog-frontend.s3-website-us-east-1.amazonaws.com`
3. Viewer protocol policy: Redirect HTTP to HTTPS
4. Default root object: `index.html`
5. Error pages: 404 → /index.html (for React Router)
6. Create distribution
7. Note CloudFront URL

---

## Option 2: Vercel + Heroku

### Backend (Heroku):

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
cd backend
heroku create welllog-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set AWS_REGION=us-east-1
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set S3_BUCKET_NAME=your_bucket
heroku config:set OPENAI_API_KEY=your_key
heroku config:set FRONTEND_URL=https://your-vercel-app.vercel.app

# Deploy
git push heroku main

# Initialize database
heroku run npm run init-db

# View logs
heroku logs --tail
```

### Frontend (Vercel):

```bash
# Install Vercel CLI
npm install -g vercel

cd frontend

# Build configuration
# Create vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

# Set environment variable
echo "VITE_API_URL=https://your-heroku-app.herokuapp.com/api" > .env.production

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

---

## Option 3: DigitalOcean

### 1. Create Droplet:
- Ubuntu 22.04
- 2GB RAM minimum
- Choose datacenter region

### 2. Initial Server Setup:

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install nginx
apt install -y nginx

# Install PM2
npm install -g pm2

# Setup firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 3. Setup Database:

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE welllog_db;
CREATE USER welllog_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE welllog_db TO welllog_user;
\q
```

### 4. Deploy Application:

```bash
# Create app directory
mkdir -p /var/www/welllog
cd /var/www/welllog

# Clone repository
git clone your-repo-url .

# Backend setup
cd backend
npm install
cp .env.example .env
nano .env  # Edit with production values

# Initialize database
npm run init-db

# Start with PM2
pm2 start server.js --name welllog-api
pm2 startup systemd
pm2 save

# Frontend setup
cd ../frontend
npm install
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env.production
npm run build

# Copy build to nginx
cp -r dist /var/www/welllog-frontend
```

### 5. Configure Nginx:

```bash
nano /etc/nginx/sites-available/welllog
```

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/welllog-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/welllog /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. SSL with Let's Encrypt:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## Post-Deployment Checklist

- [ ] Database accessible and initialized
- [ ] S3 bucket configured with proper permissions
- [ ] Backend API responding at /api/health
- [ ] Frontend accessible and loading
- [ ] File upload working
- [ ] Visualization rendering
- [ ] AI interpretation functioning
- [ ] Chatbot responding
- [ ] SSL/HTTPS configured
- [ ] Environment variables set correctly
- [ ] Logs accessible
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Domain names configured

## Monitoring and Maintenance

### Application Monitoring:

```bash
# Backend logs (PM2)
pm2 logs welllog-api

# Database connections
psql -h your-db-host -U user -d welllog_db -c "SELECT * FROM pg_stat_activity;"

# Disk usage
df -h

# Memory usage
free -h
```

### Backup Strategy:

```bash
# Database backup
pg_dump -h your-db-host -U user welllog_db > backup_$(date +%Y%m%d).sql

# Automate with cron
crontab -e
# Add: 0 2 * * * pg_dump -h localhost -U user welllog_db > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Updates:

```bash
# Pull latest code
cd /var/www/welllog
git pull

# Update backend
cd backend
npm install
pm2 restart welllog-api

# Update frontend
cd ../frontend
npm install
npm run build
cp -r dist/* /var/www/welllog-frontend/
```

## Troubleshooting

### Backend Issues:
- Check PM2 logs: `pm2 logs`
- Check system logs: `journalctl -u nginx`
- Verify environment variables: `pm2 env welllog-api`

### Database Issues:
- Check connections: `sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"`
- Check logs

: `tail -f /var/log/postgresql/postgresql-*.log`

### Frontend Issues:
- Check nginx logs: `tail -f /var/log/nginx/error.log`
- Verify build artifacts exist
- Check browser console

## Security Best Practices

1. **Never commit credentials**
2. **Use strong passwords**
3. **Enable SSL/HTTPS**
4. **Configure firewall**
5. **Regular security updates**
6. **Limit database access**
7. **Use environment variables**
8. **Implement rate limiting**
9. **Regular backups**
10. **Monitor logs**

## Cost Optimization

- Use AWS Free Tier initially
- Start with smaller instances, scale as needed
- Use CloudFront caching
- Implement API response caching
- Database connection pooling
- Optimize S3 storage class

## Support

For deployment issues:
- Check application logs
- Review cloud provider documentation
- Check GitHub repository issues
- Contact development team

---

**Deployment completed successfully! 🚀**
