const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection, syncDatabase } = require('./models');

// Load environment variables
dotenv.config();

const app = express();

// Initialize database on startup
async function initDB() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('Syncing database models...');
      await syncDatabase();
      console.log('Database models synced successfully');
    }
  } catch (error) {
    console.error('Database initialization warning (non-fatal):', error.message);
    // Continue running even if DB sync fails - fallback will be used
  }
}

// Initialize DB before routes
initDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const wellRoutes = require('./routes/wellRoutes');
const dataRoutes = require('./routes/dataRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Use routes
app.use('/api/wells', wellRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Well Log API is running' });
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    res.json({ 
      status: 'connected',
      database: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'disconnected',
      error: error.message,
      database: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        environment: process.env.NODE_ENV
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
