const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
const port = 3000;

app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const Feedback = sequelize.define('Feedback', {
  comment: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
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

app.post('/feedback', async (req, res) => {
  try {
    const { comment, name } = req.body;
    const newFeedback = await Feedback.create({ comment, name });
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(400).json({ error: 'Error creating feedback' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
