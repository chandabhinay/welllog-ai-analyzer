const { Sequelize } = require('sequelize');
require('dotenv').config();

// Log connection details for debugging
console.log('Database Configuration:');
console.log('- Host:', process.env.DB_HOST || 'localhost');
console.log('- Port:', process.env.DB_PORT || 5432);
console.log('- Database:', process.env.DB_NAME || 'welllog_db');
console.log('- User:', process.env.DB_USER || 'postgres');
console.log('- Node Env:', process.env.NODE_ENV || 'development');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'welllog_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    // Enable SSL for Render PostgreSQL (required for all environments)
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection };
