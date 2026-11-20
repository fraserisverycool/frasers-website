const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Anecdote = sequelize.define('anecdote', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  answers: {
    type: DataTypes.STRING
  },
  unmasked: {
    type: DataTypes.STRING
  },
  anecdote: {
    type: DataTypes.STRING
  }
});

module.exports = Anecdote;
