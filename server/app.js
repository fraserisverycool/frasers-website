const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const { uploadDir } = require('./middleware/upload.middleware');

const feedbackRoutes = require('./routes/feedback.routes');
const homepageRoutes = require('./routes/homepage.routes');
const ratingsRoutes = require('./routes/ratings.routes');
const anecdotesRoutes = require('./routes/anecdotes.routes');
const brightwellRoutes = require('./routes/brightwell.routes');
const welcomeImageRoutes = require('./routes/welcome-image.routes');

const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    'http://127.0.0.1:80',
    'http://127.0.0.1',
    'http://localhost:4200',
    'https://worldpeace.services',
    'http://worldpeace.services',
    'http://192.168.2.209:4200'
  ],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));

// Static welcome-image upload route
app.use('/uploads/welcome-image', express.static(uploadDir));

// Domain API routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/anecdote', anecdotesRoutes);
app.use('/api/brightwell', brightwellRoutes);
app.use('/api/upload/welcome-image', welcomeImageRoutes);

module.exports = {
  app,
  sequelize
};
