const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WellData = sequelize.define('WellData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  wellId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'well_id',
    references: {
      model: 'wells',
      key: 'id'
    }
  },
  depth: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  measurements: {
    type: DataTypes.JSONB,
    allowNull: false
  }
}, {
  tableName: 'well_data',
  timestamps: false,
  indexes: [
    {
      fields: ['well_id']
    },
    {
      fields: ['depth']
    },
    {
      fields: ['well_id', 'depth']
    }
  ]
});

module.exports = WellData;
