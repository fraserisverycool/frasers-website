const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HomepageColor = sequelize.define('HomepageColor', {
  color: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});

module.exports = HomepageColor;
