const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('rating', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  ratings: {
    type: DataTypes.STRING
  }
});

module.exports = Rating;
