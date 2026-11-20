const express = require('express');
const router = express.Router();
const { Feedback } = require('../models');
const { validateFeedback } = require('../middleware/validation.middleware');

router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving feedback' });
  }
});

router.post('/', validateFeedback, async (req, res) => {
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

module.exports = router;
