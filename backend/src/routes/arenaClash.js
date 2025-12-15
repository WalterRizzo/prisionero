const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { calculateEloChange, generateMatchId, shouldMatch } = require('../utils/arenaClashUtils');
const cardsData = require('../data/cards.json');

// Obtener perfil de usuario en Arena Clash
router.get('/profile/:username', (req, res) => {
  try {
    const { username } = req.params;
    
    const user = db.prepare(
      'SELECT * FROM arena_clash_users WHERE username = ?'
    ).get(username);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const stats = db.prepare(
      'SELECT COUNT(*) as total_matches FROM arena_clash_matches WHERE player1_id = ? OR player2_id = ?'
    ).get(user.id, user.id);
    
    res.json({
      username: user.username,
      elo: user.elo,
      wins: user.wins,
      losses: user.losses,
      winrate: user.winrate ? user.winrate.toFixed(2) : '0.00',
      totalMatches: stats.total_matches || 0
    });
  } catch (err) {
    console.error('❌ Error en /profile:', err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Leaderboard global
router.get('/leaderboard', (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const period = req.query.period || 'all'; // 'week', 'today', 'all'
    
    let query = 'SELECT * FROM arena_clash_users ORDER BY elo DESC LIMIT ?';
    
    const leaderboard = db.prepare(query).all(limit);
    
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      elo: user.elo,
      wins: user.wins,
      losses: user.losses,
      winrate: user.winrate.toFixed(2)
    }));
    
    res.json(formattedLeaderboard);
  } catch (err) {
    console.error('❌ Error en /leaderboard:', err);
    res.status(500).json({ error: 'Error al obtener leaderboard' });
  }
});

// Obtener todas las cartas
router.get('/cards', (req, res) => {
  try {
    res.json(cardsData.cards);
  } catch (err) {
    console.error('❌ Error en /cards:', err);
    res.status(500).json({ error: 'Error al obtener cartas' });
  }
});

// Crear o actualizar usuario de Arena Clash
router.post('/user/create', (req, res) => {
  try {
    const { userId, username } = req.body;
    
    const existing = db.prepare(
      'SELECT id FROM arena_clash_users WHERE user_id = ?'
    ).get(userId);
    
    if (existing) {
      return res.json({ message: 'Usuario ya existe', userId: existing.id });
    }
    
    const stmt = db.prepare(
      'INSERT INTO arena_clash_users (user_id, username, elo) VALUES (?, ?, ?)'
    );
    
    const result = stmt.run(userId, username, 1500); // ELO inicial 1500
    
    res.json({
      message: 'Usuario creado',
      userId: result.lastInsertRowid,
      elo: 1500
    });
  } catch (err) {
    console.error('❌ Error en /user/create:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

module.exports = router;
