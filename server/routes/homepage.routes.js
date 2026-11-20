const express = require('express');
const router = express.Router();
const { HomepageColor } = require('../models');
const { validateHomepageColor } = require('../middleware/validation.middleware');

router.get('/', async (req, res) => {
  try {
    const colors = await HomepageColor.findAll();
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving homepage colour' });
  }
});

router.post('/', validateHomepageColor, async (req, res) => {
  try {
    const { color } = req.body;
    const homepageColor = await HomepageColor.create({ color });
    res.status(201).json(homepageColor);
  } catch (error) {
    console.error('Error creating homepage colour:', error);
    res.status(500).json({ error: 'Error creating homepage colour', details: error.message });
  }
});

module.exports = router;
