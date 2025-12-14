const express = require('express');
const db = require('../db/database');
const router = express.Router();

// GET /api/leaderboard/top100 - Top 100 jugadores
router.get('/top100', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        username, 
        avatar,
        games_played, 
        games_won, 
        total_score,
        win_streak,
        cooperation_rate
      FROM users 
      WHERE games_played > 0
      ORDER BY total_score DESC, games_won DESC
      LIMIT 100
    `;
    
    const users = await new Promise((resolve, reject) => {
      db.db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({ 
      success: true, 
      leaderboard: users.map((u, idx) => ({
        rank: idx + 1,
        ...u
      }))
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
  }
});

// GET /api/leaderboard/top-score - Ordenado por puntos
router.get('/top-score', async (req, res) => {
  try {
    const query = `
      SELECT id, username, avatar, total_score, games_played, games_won
      FROM users 
      WHERE games_played > 0
      ORDER BY total_score DESC
      LIMIT 100
    `;
    
    const usuarios = await new Promise((resolve, reject) => {
      db.db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo ranking' });
  }
});

// GET /api/leaderboard/top-wins - Ordenado por victorias
router.get('/top-wins', async (req, res) => {
  try {
    const query = `
      SELECT id, username, avatar, games_won, games_played, total_score
      FROM users 
      WHERE games_played > 0
      ORDER BY games_won DESC
      LIMIT 100
    `;
    
    const usuarios = await new Promise((resolve, reject) => {
      db.db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo ranking victorias' });
  }
});

// GET /api/leaderboard/top-karma - Ordenado por cooperación
router.get('/top-karma', async (req, res) => {
  try {
    const query = `
      SELECT id, username, avatar, karma, cooperation_rate, games_played
      FROM users 
      WHERE games_played > 0
      ORDER BY cooperation_rate DESC, karma DESC
      LIMIT 100
    `;
    
    const usuarios = await new Promise((resolve, reject) => {
      db.db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo ranking karma' });
  }
});

module.exports = router;
