const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Well = sequelize.define('Well', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  wellName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'well_name'
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  field: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uwi: {
    type: DataTypes.STRING,
    allowNull: true
  },
  api: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startDepth: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'start_depth'
  },
  stopDepth: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'stop_depth'
  },
  step: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  nullValue: {
    type: DataTypes.FLOAT,
    defaultValue: -9999.0,
    field: 'null_value'
  },
  dateAnalyzed: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_analyzed'
  },
  s3FileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 's3_file_url'
  },
  s3FileName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 's3_file_name'
  },
  curves: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'wells',
  timestamps: true,
  underscored: true
});

module.exports = Well;
