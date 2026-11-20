const express = require('express');
const router = express.Router();
const { Rating } = require('../models');

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { ratings } = req.body;
  const stringifiedRatings = JSON.stringify(ratings);
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

module.exports = router;
