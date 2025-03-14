const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

app.use(express.json());

// Use cors middleware
app.use(cors({
  origin: 'http://localhost:4200', // Replace with your Angular app's URL
  methods: ['GET', 'POST', 'OPTIONS'],
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

sequelize.sync();

app.get('/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving feedback' });
  }
});

app.post('/feedback', [
  body('comment')
    .notEmpty().withMessage('You didn\'t even put anything down...')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
    .not().contains('<').withMessage('This comment contained a "<" and it had better be for a <3 because bitch if you wanted to do SQL injection I will publicly shame you for it')
    .not().contains('>').withMessage('Comment cannot contain ">" bitch are you trying to do SQL injection? Bitch??'),
  body('name').notEmpty().withMessage('Would love it if you could put your name'),
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
