const { sequelize, testConnection } = require('../config/database');
const Well = require('./Well');
const WellData = require('./WellData');

// Define associations
Well.hasMany(WellData, {
  foreignKey: 'wellId',
  as: 'data',
  onDelete: 'CASCADE'
});

WellData.belongsTo(Well, {
  foreignKey: 'wellId',
  as: 'well'
});

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Well,
  WellData,
  testConnection,
  syncDatabase
};
