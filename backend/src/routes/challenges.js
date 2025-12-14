const express = require('express');
const db = require('../db/database');
const XPSystem = require('../utils/xpSystem');
const router = express.Router();

/**
 * GET /api/challenges/daily - Obtener desafío diario
 */
router.get('/daily', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Buscar o crear desafío del día
    let challenge = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM daily_challenges WHERE challenge_date = ?`,
        [today],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!challenge) {
      // Crear nuevo desafío diario
      const challenges = [
        { description: '🤝 Coopera en 4 rondas (DIFÍCIL)', difficulty: 'hard', target: 4 },
        { description: '⚔️ Traiciona 3 veces (FÁCIL)', difficulty: 'easy', target: 3 },
        { description: '🏆 Gana por 5+ puntos de diferencia', difficulty: 'medium', target: 5 },
        { description: '🎯 Obtén 15+ puntos totales', difficulty: 'medium', target: 15 },
        { description: '🔥 Gana 2 duelos seguidos', difficulty: 'hard', target: 2 },
        { description: '💯 Termina con 50%+ cooperación', difficulty: 'medium', target: 50 },
        { description: '⚡ Juega 3 duelos rápidos', difficulty: 'easy', target: 3 },
        { description: '🎪 Alcanza combo x3', difficulty: 'hard', target: 3 }
      ];

      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO daily_challenges (challenge_date, description, difficulty, target_score)
           VALUES (?, ?, ?, ?)`,
          [today, randomChallenge.description, randomChallenge.difficulty, randomChallenge.target],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      challenge = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM daily_challenges WHERE challenge_date = ?`,
          [today],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    }

    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    res.status(500).json({ success: false, message: 'Error fetching challenge' });
  }
});

/**
 * POST /api/challenges/complete - Completar desafío diario
 */
router.post('/complete', async (req, res) => {
  try {
    const { username, score } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Get user
    const user = await new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM users WHERE username = ?`,
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Insert or update daily challenge score
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO daily_challenge_scores (user_id, challenge_date, score, completed, completed_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id, challenge_date) DO UPDATE SET
         score = MAX(score, ?), completed = 1, completed_at = CURRENT_TIMESTAMP`,
        [user.id, today, score, 1, score],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ success: true, message: 'Desafío completado!' });
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({ success: false, message: 'Error completing challenge' });
  }
});

/**
 * GET /api/challenges/leaderboard - Top 10 desafío diario
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const scores = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          dcs.score,
          u.username,
          u.level,
          dcs.completed_at
        FROM daily_challenge_scores dcs
        JOIN users u ON u.id = dcs.user_id
        WHERE dcs.challenge_date = ? AND dcs.completed = 1
        ORDER BY dcs.score DESC, dcs.completed_at ASC
        LIMIT 10`,
        [today],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json({ success: true, leaderboard: scores });
  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
  }
});

/**
 * GET /api/challenges/stats/:username - Estadísticas de XP y nivel
 */
router.get('/stats/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await new Promise((resolve, reject) => {
      db.get(
        `SELECT xp_total, level FROM users WHERE username = ?`,
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const xpProgress = XPSystem.getXPToNextLevel(user.xp_total);
    const rank = XPSystem.getPlayerRank(user.level);

    res.json({
      success: true,
      stats: {
        username,
        level: user.level,
        xp_total: user.xp_total,
        xp_needed: xpProgress.xpNeeded,
        xp_in_level: xpProgress.xpInCurrentLevel,
        progress_percent: xpProgress.progressPercent,
        rank
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
});

module.exports = router;
