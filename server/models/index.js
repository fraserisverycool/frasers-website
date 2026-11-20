const sequelize = require('../config/database');
const Feedback = require('./feedback.model');
const HomepageColor = require('./homepage-color.model');
const Rating = require('./rating.model');
const Anecdote = require('./anecdote.model');
const EndingStats = require('./ending-stats.model');

module.exports = {
  sequelize,
  Feedback,
  HomepageColor,
  Rating,
  Anecdote,
  EndingStats
};
