const express = require('express');
const router = express.Router();
const { EndingStats } = require('../models');

router.post('/ending', async (req, res) => {
  const { ending } = req.body;
  const validEndings = ['ending1', 'ending2', 'ending3', 'ending4', 'ending5', 'ending6', 'ending7'];

  if (!validEndings.includes(ending)) {
    return res.status(400).json({ error: 'Invalid ending' });
  }

  try {
    const [stat, created] = await EndingStats.findOrCreate({
      where: { ending },
      defaults: { count: 1 }
    });

    if (!created) {
      await stat.increment('count');
    }

    res.status(200).json({ message: 'Success', ending, count: stat.count + (created ? 0 : 1) });
  } catch (error) {
    console.error('Error updating ending stats:', error);
    res.status(500).json({ error: 'Error updating ending stats' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await EndingStats.findAll();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving ending stats' });
  }
});

module.exports = router;
