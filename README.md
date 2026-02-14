# Well Log Analysis System

A comprehensive full-stack web application for analyzing subsurface well-log data from LAS (Log ASCII Standard) files. This system provides data visualization, AI-assisted interpretation, and a conversational chatbot interface for geological analysis.

## 🎥 Demo Video

[Link to Demo Video - To be added]

## 🚀 Features

- **LAS File Upload & Storage**: Upload LAS files with automatic parsing and storage in Amazon S3
- **Interactive Visualization**: Multi-curve well-log visualization with zoom, pan, and depth range selection
- **AI-Assisted Interpretation**: GPT-4 powered geological interpretation of selected curves and depth ranges
- **Conversational Chatbot**: Ask questions about your well data using natural language
- **RESTful API**: Well-designed backend API for all operations
- **Responsive UI**: Modern React-based interface with Material-UI components

## 📋 Architecture

### Backend
- **Framework**: Node.js + Express
- **Database**: PostgreSQL with Sequelize ORM
- **Storage**: Amazon S3 for LAS file storage
- **AI**: OpenAI GPT-4 API
- **Features**:
  - RESTful API design
  - LAS file parsing
  - Efficient data storage with JSONB fields
  - Statistical analysis endpoints

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Material-UI (MUI)
- **Visualization**: Plotly.js for interactive charts
- **Routing**: React Router
- **State Management**: React Hooks

### Database Schema
- **Wells Table**: Stores metadata (name, location, depth ranges, curves)
- **WellData Table**: Stores depth-indexed measurements with JSONB for flexibility
- **Indexes**: Optimized for depth-based queries

## 🛠️ Technology Stack

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- AWS SDK (S3)
- OpenAI API
- Multer (file uploads)

**Frontend:**
- React 18
- Vite
- Material-UI
- Plotly.js
- Axios
- React Router

## 📁 Project Structure

```
Assignment_One_Geo/
├── backend/
│   ├── config/          # Database, S3, OpenAI configuration
│   ├── models/          # Sequelize models
│   ├── routes/          # API route handlers
│   ├── utils/           # LAS parser and utilities
│   ├── scripts/         # Database initialization
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   └── App.jsx      # Main app component
│   └── index.html
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- AWS Account (for S3 storage)
- OpenAI API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   cd Assignment_One_Geo
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment file and configure
   copy .env.example .env
   # Edit .env with your credentials
   
   # Initialize database
   npm run init-db
   
   # Start backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start frontend development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## ⚙️ Configuration

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name

# PostgreSQL
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

### Database Setup

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE welllog_db;
   ```

2. Run initialization script:
   ```bash
   cd backend
   npm run init-db
   ```

### AWS S3 Setup

1. Create an S3 bucket
2. Configure IAM user with S3 permissions
3. Add credentials to `.env`

## 📖 API Documentation

### Wells Endpoints

- `POST /api/wells/upload` - Upload and parse LAS file
- `GET /api/wells` - Get all wells
- `GET /api/wells/:id` - Get well by ID
- `GET /api/wells/:id/curves` - Get available curves
- `DELETE /api/wells/:id` - Delete well

### Data Endpoints

- `POST /api/data/query` - Query well data by curves and depth range
- `POST /api/data/statistics` - Get statistical summary
- `GET /api/data/depth-range/:wellId` - Get depth range info

### AI Endpoints

- `POST /api/ai/interpret` - Generate AI interpretation

### Chatbot Endpoints

- `POST /api/chatbot/query` - Send chatbot query

## 🎯 Usage Guide

1. **Upload LAS File**
   - Click "Upload LAS File" on home page
   - Select your LAS file
   - Wait for processing and storage

2. **Visualize Data**
   - Click "View" on any well card
   - Select curves to visualize
   - Adjust depth range
   - Use interactive zoom/pan features

3. **AI Interpretation**
   - Switch to "AI Interpretation" tab
   - Select curves and depth range
   - Click "Interpret" for AI analysis
   - View statistics and interpretation

4. **Use Chatbot**
   - Switch to "Chatbot" tab
   - Ask questions about the data
   - Get insights and recommendations

## 🏗️ Design Decisions

### Why PostgreSQL?
- Excellent support for JSON/JSONB for flexible curve storage
- Strong indexing capabilities for depth-based queries
- ACID compliance for data integrity
- Wide ecosystem support

### Why JSONB for Measurements?
- LAS files have variable numbers of curves
- Flexible schema without migrations for new curve types
- Efficient querying with GIN indexes
- Smaller storage footprint than normalized tables

### Why Plotly.js?
- Interactive out of the box (zoom, pan, hover)
- Handles large datasets efficiently
- Multi-axis support for multiple curves
- Professional visualization quality

### API Security
- Environment variables for sensitive credentials
- CORS protection
- Input validation
- Error handling without exposing internals

## 🚀 Deployment

### Backend Deployment (AWS Elastic Beanstalk)

1. Install EB CLI
2. Initialize and deploy:
   ```bash
   cd backend
   eb init
   eb create welllog-api
   eb deploy
   ```

### Frontend Deployment (Vercel/Netlify)

1. Build production bundle:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

### Database (AWS RDS)

1. Create PostgreSQL RDS instance
2. Update backend `.env` with RDS credentials
3. Run migrations

## 👥 Team Access

Repository access granted to:
- shilu143
- mahesh-248
- manish-44
- Grudev100
- crhodes-dev

## 📝 Key Features Implemented

✅ Full-stack architecture with proper separation  
✅ LAS file upload and S3 storage  
✅ PostgreSQL database with optimized schema  
✅ Multi-curve visualization with Plotly  
✅ Interactive depth range selection  
✅ AI-powered interpretation with GPT-4  
✅ Conversational chatbot interface  
✅ RESTful API design  
✅ Responsive Material-UI interface  
✅ Environment-based configuration  
✅ Error handling and validation  

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists

### S3 Upload Issues
- Check AWS credentials
- Verify bucket exists and has correct permissions
- Ensure region is correct

### OpenAI API Issues
- Verify API key is valid
- Check API usage limits
- Application has fallback interpretations

## 📄 License

This project is for educational/assignment purposes.

## 🤝 Contributing

This is an assignment project. For questions or issues, please contact the development team.

## 📧 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for geological data analysis**
