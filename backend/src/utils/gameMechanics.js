/**
 * Game Mechanics Calculator
 * Implementa todas las reglas de balance del Prisoner's Dilemma
 * 
 * Uso: Importar en game routes para calcular puntos automáticamente
 */

class GameMechanicsCalculator {
  /**
   * Calcula el multiplicador por racha de traiciones
   * @param {number} betrayalStreak - Número de traiciones consecutivas
   * @returns {number} Multiplicador (1.0, 0.9, 0.75, 0.5)
   */
  static calculateBetrayalStreakMultiplier(betrayalStreak) {
    if (betrayalStreak === 0) return 1.0;
    if (betrayalStreak === 1) return 1.0;
    if (betrayalStreak === 2) return 0.9;
    if (betrayalStreak === 3) return 0.75;
    return 0.5; // 4 o más
  }

  /**
   * Calcula la reputación basada en historial de acciones
   * @param {number} cooperations - Total de cooperaciones
   * @param {number} betrayals - Total de traiciones
   * @returns {number} Reputación (-100 a +100)
   */
  static calculateReputation(cooperations, betrayals) {
    const total = cooperations + betrayals;
    if (total === 0) return 0;
    
    const reputation = ((cooperations - (betrayals * 1.5)) / total) * 100;
    return Math.max(-100, Math.min(100, Math.round(reputation)));
  }

  /**
   * Obtiene el bonus por reputación
   * @param {number} reputation - Valor de reputación (-100 a +100)
   * @returns {number} Multiplicador (0.8, 1.0, 1.2)
   */
  static getReputationBonus(reputation) {
    if (reputation >= 80) return 1.2;    // ⭐ Confiable
    if (reputation >= 50) return 1.0;    // 🟢 Bueno
    if (reputation >= -50) return 1.0;   // 🟡 Neutro
    if (reputation >= -79) return 0.8;   // 🟠 Sospechoso
    return 0.8;                          // 🔴 Traidor
  }

  /**
   * Obtiene etiqueta de reputación
   * @param {number} reputation - Valor de reputación
   * @returns {string} Etiqueta legible
   */
  static getReputationLabel(reputation) {
    if (reputation >= 80) return '⭐ Confiable';
    if (reputation >= 50) return '🟢 Bueno';
    if (reputation >= -50) return '🟡 Neutro';
    if (reputation >= -79) return '🟠 Sospechoso';
    return '🔴 Traidor';
  }

  /**
   * Calcula el efecto de la fatiga en los puntos
   * @param {number} fatigueLevel - Nivel de fatiga (0-20)
   * @returns {number} Multiplicador (0.0 a 1.0)
   */
  static calculateFatigueReducer(fatigueLevel) {
    return Math.max(0, 1 - (fatigueLevel * 0.05));
  }

  /**
   * Calcula multiplicador por bonus de cooperación
   * @param {number} cooperationStreak - Cooperaciones consecutivas
   * @returns {number} Multiplicador
   */
  static calculateCooperationMultiplier(cooperationStreak) {
    if (cooperationStreak >= 5) return 1.5;  // Combo x1.5
    return 1.0;
  }

  /**
   * Revisa si hay bonificación de cooperación en esta ronda
   * @param {number} cooperationStreak - Streak anterior
   * @returns {object|null} { type, bonus, message } o null
   */
  static checkCooperationBonus(cooperationStreak) {
    cooperationStreak++; // Sumar la cooperación actual
    
    if (cooperationStreak === 3) {
      return {
        type: 'bonus_3x',
        bonus: 0.2, // 20% extra
        message: '🎁 3 Cooperaciones! +20% bonus'
      };
    }
    
    if (cooperationStreak === 5) {
      return {
        type: 'combo_5x',
        bonus: 0.5, // x1.5 = 50% extra
        message: '🔥 COMBO x1.5 activado!'
      };
    }
    
    if (cooperationStreak === 8) {
      return {
        type: 'achievement_8x',
        bonus: 50, // Puntos fijos
        message: '🏅 LOGRO DESBLOQUEADO: Pacifista!',
        achievement: 'Pacifista'
      };
    }
    
    return null;
  }

  /**
   * Calcula penalización de últimas rondas
   * @param {number} currentRound - Ronda actual (0-indexed)
   * @param {number} totalRounds - Total de rondas en la partida
   * @param {number} cooperationRate - % de cooperaciones (0-1)
   * @param {string} action - 'COOPERATE' o 'BETRAY'
   * @returns {number} Multiplicador (0.5 o 1.0)
   */
  static calculateLateGamePenalty(currentRound, totalRounds, cooperationRate, action) {
    const isLastRound = currentRound >= totalRounds - 2;
    const lowCooperation = cooperationRate < 0.4;
    const isBetray = action === 'BETRAY';
    
    if (isLastRound && lowCooperation && isBetray) {
      return 0.5;
    }
    
    return 1.0;
  }

  /**
   * FUNCIÓN PRINCIPAL: Calcula puntos finales con todas las reglas
   * @param {object} params - Parámetros del cálculo
   * @returns {object} { points, breakdown, messages }
   */
  static calculateFinalPoints(params) {
    const {
      basePoints = 10,
      action,
      betrayalStreak = 0,
      cooperationStreak = 0,
      fatigueLevel = 0,
      reputation = 0,
      currentRound = 0,
      totalRounds = 10,
      totalCooperations = 0,
      totalBetrayals = 0
    } = params;

    let points = basePoints;
    const messages = [];
    const breakdown = {};

    // 1. Multiplicador por racha de traición
    if (action === 'BETRAY') {
      const streakMult = this.calculateBetrayalStreakMultiplier(betrayalStreak + 1);
      breakdown.betrayalStreakMultiplier = streakMult;
      points *= streakMult;
      
      if (betrayalStreak >= 2) {
        messages.push(`⚠️ Racha de traición (${betrayalStreak + 1}): ${(streakMult * 100).toFixed(0)}%`);
      }
    } else {
      breakdown.betrayalStreakMultiplier = 1.0;
    }

    // 2. Multiplicador por cooperación sostenida
    const coopMult = this.calculateCooperationMultiplier(cooperationStreak);
    breakdown.cooperationMultiplier = coopMult;
    points *= coopMult;

    // Bonificación de cooperación
    if (action === 'COOPERATE') {
      const coopBonus = this.checkCooperationBonus(cooperationStreak);
      if (coopBonus) {
        breakdown.cooperationBonus = coopBonus;
        if (coopBonus.type === 'achievement_8x') {
          points += coopBonus.bonus; // Puntos fijos
        } else {
          points *= (1 + coopBonus.bonus);
        }
        messages.push(coopBonus.message);
      }
    }

    // 3. Fatiga de traición
    const fatigueReducer = this.calculateFatigueReducer(fatigueLevel);
    breakdown.fatigueLevel = fatigueLevel;
    breakdown.fatigueReducer = fatigueReducer;
    points *= fatigueReducer;

    if (action === 'BETRAY' && fatigueLevel >= 5) {
      messages.push(`⚠️ Estás cansado. Puntos reducidos por fatiga.`);
    }

    // 4. Bonus por reputación
    const reputationBonus = this.getReputationBonus(reputation);
    breakdown.reputation = reputation;
    breakdown.reputationLabel = this.getReputationLabel(reputation);
    breakdown.reputationBonus = reputationBonus;
    points *= reputationBonus;

    // 5. Penalización de últimas rondas
    const cooperationRate = (totalCooperations + (action === 'COOPERATE' ? 1 : 0)) / 
                           (totalCooperations + totalBetrayals + 1);
    const lateGameMult = this.calculateLateGamePenalty(
      currentRound,
      totalRounds,
      cooperationRate,
      action
    );
    breakdown.lateGameMultiplier = lateGameMult;
    points *= lateGameMult;

    if (lateGameMult < 1.0) {
      messages.push('🚫 Última ronda penalty: traición vale 50%');
    }

    // Redondear puntos finales
    points = Math.round(points * 10) / 10;

    breakdown.finalAction = action;
    breakdown.basePoints = basePoints;
    breakdown.finalPoints = points;

    return {
      points,
      breakdown,
      messages
    };
  }

  /**
   * Genera reporte legible de cálculo
   * @param {object} result - Resultado de calculateFinalPoints
   * @returns {string} Reporte formateado
   */
  static generateReport(result) {
    const { breakdown, messages } = result;
    
    let report = `
    ═══════════════════════════════════════
    📊 DESGLOSE DE PUNTOS
    ═══════════════════════════════════════
    
    Base: ${breakdown.basePoints} puntos
    Racha traición: x${breakdown.betrayalStreakMultiplier}
    Multiplicador coop: x${breakdown.cooperationMultiplier}
    ${breakdown.cooperationBonus ? `Bonus coop: ${breakdown.cooperationBonus.type}` : ''}
    Fatiga: ${breakdown.fatigueLevel}/20 (x${breakdown.fatigueReducer.toFixed(2)})
    Reputación: ${breakdown.reputationLabel} (x${breakdown.reputationBonus})
    Última ronda: x${breakdown.lateGameMultiplier}
    
    ═══════════════════════════════════════
    ✅ PUNTOS FINALES: ${breakdown.finalPoints}
    ═══════════════════════════════════════
    `;

    if (messages.length > 0) {
      report += `\n📢 MENSAJES:\n`;
      messages.forEach(msg => {
        report += `   ${msg}\n`;
      });
    }

    return report;
  }
}

// Exportar para uso en backend
module.exports = GameMechanicsCalculator;
