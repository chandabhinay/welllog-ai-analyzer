# Well Log Analysis System - Backend

Backend API server for the Well Log Analysis System.

## Features

- RESTful API for well-log data management
- LAS file parsing and storage
- PostgreSQL database with Sequelize ORM
- AWS S3 integration for file storage
- OpenAI GPT-4 integration for AI interpretation
- Comprehensive error handling

## Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize
- AWS SDK (S3)
- OpenAI API
- Multer (file uploads)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` with your credentials:
   - Database credentials
   - AWS S3 credentials
   - OpenAI API key

3. Initialize database:
   ```bash
   npm run init-db
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Server will run on http://localhost:5000

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET_NAME=well-log-files

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=welllog_db
DB_USER=postgres
DB_PASSWORD=your_password

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# CORS
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health check

### Wells
- `POST /api/wells/upload` - Upload LAS file
- `GET /api/wells` - Get all wells
- `GET /api/wells/:id` - Get well by ID
- `GET /api/wells/:id/curves` - Get available curves
- `DELETE /api/wells/:id` - Delete well

### Data
- `POST /api/data/query` - Query well data
  ```json
  {
    "wellId": "uuid",
    "curves": ["HC1", "HC2"],
    "startDepth": 8665,
    "endDepth": 9000,
    "limit": 5000
  }
  ```

- `POST /api/data/statistics` - Get statistics
  ```json
  {
    "wellId": "uuid",
    "curves": ["HC1", "HC2"],
    "startDepth": 8665,
    "endDepth": 9000
  }
  ```

- `GET /api/data/depth-range/:wellId` - Get depth range

### AI Interpretation
- `POST /api/ai/interpret` - Generate interpretation
  ```json
  {
    "wellId": "uuid",
    "curves": ["HC1", "TOTAL_GAS"],
    "startDepth": 8665,
    "endDepth": 9000
  }
  ```

### Chatbot
- `POST /api/chatbot/query` - Chat query
  ```json
  {
    "wellId": "uuid",
    "message": "What curves are available?",
    "conversationHistory": []
  }
  ```

## Database Schema

### Wells Table
- id (UUID, PK)
- wellName (String)
- company (String)
- field (String)
- location (String)
- country (String)
- state (String)
- uwi (String)
- api (String)
- startDepth (Float)
- stopDepth (Float)
- step (Float)
- nullValue (Float)
- dateAnalyzed (Date)
- s3FileUrl (String)
- s3FileName (String)
- curves (JSONB)
- metadata (JSONB)
- createdAt (Timestamp)
- updatedAt (Timestamp)

### WellData Table
- id (UUID, PK)
- wellId (UUID, FK)
- depth (Float)
- measurements (JSONB)

Indexes:
- (wellId, depth)
- (depth)

## Project Structure

```
backend/
├── config/
│   ├── database.js      # Database configuration
│   ├── s3.js           # AWS S3 configuration
│   └── openai.js       # OpenAI configuration
├── models/
│   ├── index.js        # Model exports
│   ├── Well.js         # Well model
│   └── WellData.js     # WellData model
├── routes/
│   ├── wellRoutes.js   # Well endpoints
│   ├── dataRoutes.js   # Data query endpoints
│   ├── aiRoutes.js     # AI interpretation
│   └── chatbotRoutes.js # Chatbot endpoints
├── utils/
│   └── lasParser.js    # LAS file parser
├── scripts/
│   └── initDatabase.js # Database initialization
├── server.js           # Express server
├── package.json
└── .env.example
```

## Development

### Adding New Endpoints

1. Create route file in `routes/`
2. Implement route handlers
3. Register routes in `server.js`

### Database Migrations

To reset database (warning: deletes all data):
```bash
# Edit scripts/initDatabase.js and set force: true
npm run init-db
```

## Testing

Test endpoints with curl or Postman:

```bash
# Health check
curl http://localhost:5000/api/health

# Get all wells
curl http://localhost:5000/api/wells

# Upload LAS file
curl -X POST http://localhost:5000/api/wells/upload \
  -F "file=@path/to/file.las"
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production database
3. Configure S3 bucket with proper permissions
4. Set up SSL/HTTPS
5. Use process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start server.js --name welllog-api
   ```

## Troubleshooting

### Database Issues
- Ensure PostgreSQL is running
- Check connection credentials
- Verify database exists

### S3 Upload Fails
- Check AWS credentials
- Verify bucket permissions
- Ensure bucket name is correct

### OpenAI Errors
- Verify API key
- Check rate limits
- Application has fallback responses

## Security Notes

- Never commit `.env` file
- Use strong database passwords
- Restrict S3 bucket permissions
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting for production

## Performance Optimization

- Uses connection pooling for database
- Batch inserts for well data
- JSONB indexes for fast queries
- Limits query result sizes
- Pagination for large datasets

## License

Educational/Assignment Project
