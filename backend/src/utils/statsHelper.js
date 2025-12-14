// Funciones para actualizar estadísticas y achievements de usuarios
const db = require('../db/database');

const updateUserStats = async (userId, gameResult) => {
  try {
    const { won, score, cooperationRate, strategy } = gameResult;

    // Obtener usuario actual
    const userQuery = `SELECT * FROM users WHERE id = ?`;
    const user = await new Promise((resolve, reject) => {
      db.db.get(userQuery, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) return;

    // Actualizar stats
    const newGamesPlayed = user.games_played + 1;
    const newGamesWon = won ? user.games_won + 1 : user.games_won;
    const newGamesLost = won ? user.games_lost : user.games_lost + 1;
    const newWinStreak = won ? (user.win_streak || 0) + 1 : 0;
    const newMaxWinStreak = newWinStreak > (user.max_win_streak || 0) ? newWinStreak : (user.max_win_streak || 0);
    const newTotalScore = user.total_score + score;
    const newCooperationRate = cooperationRate;

    const updateQuery = `
      UPDATE users 
      SET games_played = ?, games_won = ?, games_lost = ?, 
          total_score = ?, cooperation_rate = ?, favorite_strategy = ?,
          win_streak = ?, max_win_streak = ?
      WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      db.db.run(
        updateQuery,
        [newGamesPlayed, newGamesWon, newGamesLost, newTotalScore, 
         newCooperationRate, strategy || 'balanced', newWinStreak, newMaxWinStreak, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Verificar y desbloquear achievements
    await unlockAchievements(userId, {
      won,
      gamesWon: newGamesWon,
      maxWinStreak: newMaxWinStreak,
      cooperationRate: newCooperationRate,
      totalScore: newTotalScore
    });

  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

const unlockAchievements = async (userId, stats) => {
  try {
    const achievementsToUnlock = [];

    // Primer triunfo
    if (stats.won && stats.gamesWon === 1) {
      achievementsToUnlock.push('first-win');
    }

    // Estratega (10 victorias)
    if (stats.gamesWon === 10) {
      achievementsToUnlock.push('strategist');
    }

    // Maestro del Karma (80% cooperación)
    if (stats.cooperationRate >= 80) {
      achievementsToUnlock.push('karma-master');
    }

    // Maestro de Rachas (5 victorias consecutivas)
    if (stats.maxWinStreak >= 5) {
      achievementsToUnlock.push('streak-master');
    }

    // Rey de la Remontada (ganar con desventaja - simplificado)
    if (stats.won && stats.totalScore > 50) {
      achievementsToUnlock.push('comeback-king');
    }

    // Insertar achievements desbloqueados
    for (const achievement of achievementsToUnlock) {
      const checkQuery = `SELECT id FROM achievements WHERE user_id = ? AND achievement_type = ?`;
      const exists = await new Promise((resolve, reject) => {
        db.db.get(checkQuery, [userId, achievement], (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        });
      });

      if (!exists) {
        const insertQuery = `INSERT INTO achievements (user_id, achievement_type) VALUES (?, ?)`;
        await new Promise((resolve, reject) => {
          db.db.run(insertQuery, [userId, achievement], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`🏆 Achievement unlocked for user ${userId}: ${achievement}`);
      }
    }
  } catch (error) {
    console.error('Error unlocking achievements:', error);
  }
};

module.exports = {
  updateUserStats,
  unlockAchievements
};
