const express = require('express');
const router = express.Router();
const { Anecdote } = require('../models');

router.get('/', async (req, res) => {
  try {
    const anecdotes = await Anecdote.findAll();
    res.json(anecdotes);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving anecdotes' });
  }
});

router.post('/:id', async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  try {
    const anecdote = await Anecdote.findOne({
      where: {
        id: id
      }
    });

    const answers = JSON.parse(anecdote.answers).map(a => a.trim().toLowerCase());

    if (answers.includes(answer.trim().toLowerCase())) {
      res.json(anecdote);
    } else {
      res.status(400).json({ error: 'Wrong answer' });
    }
  } catch (err) {
    console.error('Error finding anecdote:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { anecdote, answers, unmasked } = req.body;
  const stringifiedAnswers = JSON.stringify(answers);
  try {
    const [anecdoteModel, created] = await Anecdote.findOrCreate({
      where: { id },
      defaults: { anecdote, answers: stringifiedAnswers, unmasked }
    });
    if (!created) {
      await anecdoteModel.update({ anecdote, answers: stringifiedAnswers, unmasked });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
