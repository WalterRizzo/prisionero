const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Obtener ranking por score
router.get('/top-score', async (req, res) => {
  try {
    const usuarios = await User.find()
      .sort({ 'stats.totalScore': -1 })
      .limit(100)
      .select('username stats avatar');

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo ranking' });
  }
});

// Obtener ranking por karma (cooperación)
router.get('/top-karma', async (req, res) => {
  try {
    const usuarios = await User.find()
      .sort({ 'stats.karma': -1 })
      .limit(100)
      .select('username stats avatar');

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo ranking karma' });
  }
});

// Obtener ranking por partidas ganadas
router.get('/top-wins', async (req, res) => {
  try {
    const usuarios = await User.find()
      .sort({ 'stats.gamesWon': -1 })
      .limit(100)
      .select('username stats avatar');

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo ranking victorias' });
  }
});

module.exports = router;
