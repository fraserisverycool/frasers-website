const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

app.use(express.json());

app.use(cors({
  origin: ['http://127.0.0.1:80', 'http://127.0.0.1', 'http://localhost:4200', 'https://worldpeace.services', 'http://worldpeace.services'],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#ffffff'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});

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

const Rating = sequelize.define('rating', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  ratings: {
    type: DataTypes.STRING,
  }
});

sequelize.sync();

app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving feedback' });
  }
});

app.post('/api/feedback', [
  body('comment')
    .notEmpty().withMessage('You didn\'t even put anything down...')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
    .not().contains('<').withMessage('This comment contained a "<" and it had better be for a <3 because bitch if you wanted to inject code or something I will publicly shame you for it')
    .not().contains('>').withMessage('Comment cannot contain ">" bitch are you trying to hack me or something? Bitch??'),
  body('name')
    .notEmpty().withMessage('Would love it if you could put down a name')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters')
    .not().contains('<').withMessage('This name contained a "<" and it had better be for a <3 because bitch if you wanted to inject code or something I will publicly shame you for it')
    .not().contains('>').withMessage('Name cannot contain ">" bitch are you trying to hack me or something? Bitch??'),
  body('color')
    .optional()
    .matches(/^#([0-9a-fA-F]{6})$/).withMessage('The colour needs to be a valid hex code')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
    try {
    const { comment, name, color } = req.body;

    const existingFeedback = await Feedback.findOne({ where: { name } });
    if (existingFeedback) {
      return res.status(400).json({ errors: [{ msg: 'You\'ve already posted something, best to leave room for others don\'t you think' }] });
    }

    const newFeedback = await Feedback.create({ comment, name, color });
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Error creating feedback', details: error.message });
  }

});

app.get('/api/homepage', async (req, res) => {
  try {
    const colors = await HomepageColor.findAll();
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving homepage colour' });
  }
});

app.post('/api/homepage', [
  body('color')
    .notEmpty().withMessage('You have to put a colour (a hex code) into the box')
    .matches(/^#([0-9a-fA-F]{6})$/).withMessage('The colour needs to be a valid hex code')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { color } = req.body;

    const homepageColor = await HomepageColor.create({ color });
    res.status(201).json(homepageColor);
  } catch (error) {
    console.error('Error creating homepage colour:', error);
    res.status(500).json({ error: 'Error creating homepage colour', details: error.message });
  }
});

app.post('/api/ratings', async (req, res) => {
  const { ids } = req.body;

  try {
    const ratings = await Rating.findAll({
      where: {
        id: ids
      }
    });

    const parsedRatings = ratings.map(rating => ({
      id: rating.id,
      ratings: JSON.parse(rating.ratings)
    }));

    res.json(parsedRatings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/ratings/:id', async (req, res) => {
  const { id } = req.params;
  const { ratings } = req.body; // Destructure directly from req.body
  const stringifiedRatings = JSON.stringify(ratings); // Stringify ratings for storage
  try {
    const [rating, created] = await Rating.findOrCreate({
      where: { id },
      defaults: { ratings: stringifiedRatings }
    });
    if (!created) {
      await rating.update({ ratings: stringifiedRatings });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
