const db = require('../db/database');

/**
 * Sistema de XP y Niveles
 */
class XPSystem {
  // Calcular XP por victoria
  static getXPForVictory(score, cooperationRate) {
    let xp = 10; // Base
    xp += Math.floor(score / 10); // +1 XP per 10 points
    xp += Math.floor(cooperationRate / 20); // +1 XP per 20% cooperation
    return Math.max(10, xp);
  }

  // Actualizar XP y nivel
  static addXP(userId, xpAmount, reason = 'victory') {
    return new Promise((resolve, reject) => {
      // Log the XP gain
      db.run(
        `INSERT INTO xp_logs (user_id, xp_gained, reason) VALUES (?, ?, ?)`,
        [userId, xpAmount, reason],
        function(err) {
          if (err) reject(err);
          else {
            // Update user XP
            db.run(
              `UPDATE users SET xp_total = xp_total + ? WHERE id = ?`,
              [xpAmount, userId],
              function(err) {
                if (err) reject(err);
                else {
                  // Calculate new level (1000 XP per level)
                  db.get(
                    `SELECT xp_total FROM users WHERE id = ?`,
                    [userId],
                    (err, row) => {
                      if (err) reject(err);
                      else {
                        const newLevel = Math.floor((row?.xp_total || 0) / 1000) + 1;
                        db.run(
                          `UPDATE users SET level = ? WHERE id = ?`,
                          [newLevel, userId],
                          (err) => {
                            if (err) reject(err);
                            else resolve({ xpGained: xpAmount, newLevel });
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  }

  // Obtener rango de usuario
  static getPlayerRank(level) {
    if (level >= 50) return '👑 Leyenda';
    if (level >= 40) return '⭐ Maestro';
    if (level >= 30) return '🏆 Experto';
    if (level >= 20) return '💎 Avanzado';
    if (level >= 10) return '🥈 Intermedio';
    return '🌱 Novato';
  }

  // Obtener próximo hito de XP
  static getXPToNextLevel(currentXP) {
    const currentLevel = Math.floor(currentXP / 1000);
    const xpInCurrentLevel = currentXP % 1000;
    const xpNeeded = 1000 - xpInCurrentLevel;
    return { xpNeeded, xpInCurrentLevel, progressPercent: (xpInCurrentLevel / 1000) * 100 };
  }
}

module.exports = XPSystem;
