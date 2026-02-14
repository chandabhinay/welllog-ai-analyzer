const { testConnection, syncDatabase } = require('../models');

async function initDatabase() {
  try {
    console.log('Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    console.log('Synchronizing database models...');
    await syncDatabase();
    
    console.log('\nDatabase initialization complete!');
    console.log('Tables created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();
