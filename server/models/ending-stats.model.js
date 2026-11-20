const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EndingStats = sequelize.define('EndingStats', {
  ending: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = EndingStats;
