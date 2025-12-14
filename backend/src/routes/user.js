const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Generar código de referral único
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// GET /api/user/profile/:username - Obtener perfil del usuario
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const userQuery = `
      SELECT 
        id, username, avatar, games_played, games_won, games_lost,
        total_score, cooperation_rate, favorite_strategy, win_streak,
        max_win_streak, referral_code, created_at
      FROM users 
      WHERE username = ?
    `;

    const user = await new Promise((resolve, reject) => {
      db.get(userQuery, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Obtener achievements del usuario
    const achievQuery = `SELECT achievement_type, unlocked_at FROM achievements WHERE user_id = ?`;
    const achievements = await new Promise((resolve, reject) => {
      db.all(achievQuery, [user.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({ 
      success: true, 
      profile: {
        ...user,
        achievements: achievements.map(a => a.achievement_type),
        winRate: user.games_played > 0 ? ((user.games_won / user.games_played) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo perfil' });
  }
});

// GET /api/user/referral-code - Obtener o crear código de referral
router.get('/referral-code/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const userQuery = `SELECT id, referral_code FROM users WHERE username = ?`;
    const user = await new Promise((resolve, reject) => {
      db.get(userQuery, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    let referralCode = user.referral_code;
    
    // Generar código si no existe
    if (!referralCode) {
      referralCode = generateReferralCode();
      const updateQuery = `UPDATE users SET referral_code = ? WHERE id = ?`;
      await new Promise((resolve, reject) => {
        db.run(updateQuery, [referralCode, user.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    res.json({ success: true, referralCode, username });
  } catch (error) {
    console.error('Error fetching referral code:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo código' });
  }
});

// GET /api/user/achievements/:username - Obtener achievements del usuario
router.get('/achievements/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const userQuery = `SELECT id FROM users WHERE username = ?`;
    const user = await new Promise((resolve, reject) => {
      db.get(userQuery, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const achievQuery = `
      SELECT achievement_type, unlocked_at 
      FROM achievements 
      WHERE user_id = ?
      ORDER BY unlocked_at DESC
    `;
    
    const achievements = await new Promise((resolve, reject) => {
      db.all(achievQuery, [user.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Definir metadata de achievements
    const achievementMetadata = {
      'first-win': { name: 'Primer Triunfo', icon: '🏆', description: 'Gana tu primera partida' },
      'strategist': { name: 'Estratega', icon: '🧠', description: 'Gana 10 partidas' },
      'comeback-king': { name: 'Rey de la Remontada', icon: '⚡', description: 'Gana una partida bajo puntuación' },
      'karma-master': { name: 'Maestro del Karma', icon: '✨', description: 'Alcanza 80% de cooperación' },
      'streak-master': { name: 'Maestro de Rachas', icon: '🔥', description: 'Logra 5 victorias consecutivas' }
    };

    res.json({ 
      success: true, 
      achievements: achievements.map(a => ({
        type: a.achievement_type,
        ...achievementMetadata[a.achievement_type],
        unlockedAt: a.unlocked_at
      }))
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo achievements' });
  }
});

module.exports = router;
