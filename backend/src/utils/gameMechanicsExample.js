/**
 * Ejemplo de cómo integrar GameMechanicsCalculator en las rutas de juego
 * 
 * Este archivo es REFERENCIA - copia estas secciones a tus rutas reales
 */

const GameMechanicsCalculator = require('../utils/gameMechanics');

// ============================================================
// EJEMPLO 1: Endpoint para jugar una ronda
// ============================================================
async function playRound(req, res) {
  try {
    const { gameId } = req.params;
    const { action } = req.body; // 'COOPERATE' o 'BETRAY'
    const playerId = req.user.id;

    // Validar acción
    if (!['COOPERATE', 'BETRAY'].includes(action)) {
      return res.status(400).json({ error: 'Acción inválida' });
    }

    // Obtener partida actual
    const game = await db.get(`
      SELECT * FROM games WHERE id = ? AND status = 'playing'
    `, [gameId]);

    if (!game) {
      return res.status(404).json({ error: 'Partida no encontrada o terminada' });
    }

    // Obtener estado actual del jugador en la partida
    const playerState = await db.get(`
      SELECT * FROM game_states WHERE game_id = ? AND player_id = ?
    `, [gameId, playerId]);

    // Obtener stats globales del jugador (para reputación)
    const playerStats = await db.get(`
      SELECT * FROM player_stats WHERE user_id = ?
    `, [playerId]);

    // ===== CALCULAR PUNTOS FINALES =====
    const calculationResult = GameMechanicsCalculator.calculateFinalPoints({
      basePoints: 10, // Ajustar según la ronda
      action,
      betrayalStreak: playerState.betrayal_streak,
      cooperationStreak: playerState.cooperation_streak,
      fatigueLevel: playerState.fatigue_level,
      reputation: playerStats.reputation,
      currentRound: game.current_round,
      totalRounds: game.total_rounds,
      totalCooperations: playerStats.total_cooperations,
      totalBetrayals: playerStats.total_betrayals
    });

    const { points, breakdown, messages } = calculationResult;

    // ===== ACTUALIZAR ESTADO DEL JUGADOR =====
    if (action === 'BETRAY') {
      await db.run(`
        UPDATE game_states 
        SET betrayal_streak = ?,
            cooperation_streak = 0,
            fatigue_level = ?
        WHERE game_id = ? AND player_id = ?
      `, [
        playerState.betrayal_streak + 1,
        Math.min(20, playerState.fatigue_level + 1),
        gameId,
        playerId
      ]);
    } else {
      await db.run(`
        UPDATE game_states 
        SET cooperation_streak = ?,
            betrayal_streak = 0,
            fatigue_level = ?
        WHERE game_id = ? AND player_id = ?
      `, [
        playerState.cooperation_streak + 1,
        Math.max(0, playerState.fatigue_level - 1),
        gameId,
        playerId
      ]);
    }

    // ===== GUARDAR RONDA =====
    await db.run(`
      INSERT INTO game_rounds (
        game_id, round_number, player_id, action, 
        points_gained, betrayal_streak, fatigue_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      gameId,
      game.current_round,
      playerId,
      action,
      points,
      breakdown.betrayalStreakMultiplier === 1.0 ? 0 : 1,
      breakdown.fatigueLevel
    ]);

    // ===== ACTUALIZAR PUNTOS TOTALES =====
    const playerKey = game.player1_id === playerId ? 'player1' : 'player2';
    await db.run(`
      UPDATE games 
      SET ${playerKey}_points = ${playerKey}_points + ?
      WHERE id = ?
    `, [points, gameId]);

    // ===== RESPUESTA =====
    res.json({
      success: true,
      roundResult: {
        action,
        pointsGained: points,
        breakdown,
        messages
      },
      report: GameMechanicsCalculator.generateReport(calculationResult)
    });

  } catch (error) {
    console.error('Error en playRound:', error);
    res.status(500).json({ error: 'Error al procesar la jugada' });
  }
}

// ============================================================
// EJEMPLO 2: Endpoint para obtener stats del jugador
// ============================================================
async function getPlayerStats(req, res) {
  try {
    const { userId } = req.params;

    // Obtener stats
    const stats = await db.get(`
      SELECT * FROM player_stats WHERE user_id = ?
    `, [userId]);

    if (!stats) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    // Calcular reputación actual
    const reputation = GameMechanicsCalculator.calculateReputation(
      stats.total_cooperations,
      stats.total_betrayals
    );

    // Obtener últimas 5 partidas
    const recentGames = await db.all(`
      SELECT * FROM games 
      WHERE player1_id = ? OR player2_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId, userId]);

    res.json({
      userId,
      reputation,
      reputationLabel: GameMechanicsCalculator.getReputationLabel(reputation),
      reputationBonus: GameMechanicsCalculator.getReputationBonus(reputation),
      totalGames: stats.total_games,
      totalRounds: stats.total_rounds,
      cooperationRate: (stats.total_cooperations / stats.total_rounds * 100).toFixed(1) + '%',
      stats: {
        cooperations: stats.total_cooperations,
        betrayals: stats.total_betrayals,
        total: stats.total_cooperations + stats.total_betrayals
      },
      recentGames
    });

  } catch (error) {
    console.error('Error en getPlayerStats:', error);
    res.status(500).json({ error: 'Error al obtener stats' });
  }
}

// ============================================================
// EJEMPLO 3: Finalizar partida y actualizar reputación
// ============================================================
async function finishGame(req, res) {
  try {
    const { gameId } = req.params;

    // Obtener partida
    const game = await db.get('SELECT * FROM games WHERE id = ?', [gameId]);

    if (!game) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    // Marcar como finalizada
    await db.run(`
      UPDATE games SET status = 'finished' WHERE id = ?
    `, [gameId]);

    // Actualizar reputación de ambos jugadores
    const updateReputationForPlayer = async (playerId) => {
      const stats = await db.get(`
        SELECT * FROM player_stats WHERE user_id = ?
      `, [playerId]);

      const reputation = GameMechanicsCalculator.calculateReputation(
        stats.total_cooperations,
        stats.total_betrayals
      );

      await db.run(`
        UPDATE player_stats 
        SET reputation = ?, last_updated = NOW()
        WHERE user_id = ?
      `, [reputation, playerId]);
    };

    await updateReputationForPlayer(game.player1_id);
    await updateReputationForPlayer(game.player2_id);

    // Obtener resultado final
    const result = {
      player1: {
        id: game.player1_id,
        points: game.player1_points,
        won: game.player1_points > game.player2_points
      },
      player2: {
        id: game.player2_id,
        points: game.player2_points,
        won: game.player2_points > game.player1_points
      }
    };

    res.json({
      success: true,
      gameFinished: result
    });

  } catch (error) {
    console.error('Error en finishGame:', error);
    res.status(500).json({ error: 'Error al finalizar partida' });
  }
}

// ============================================================
// EJEMPLO 4: Testing - Simular una ronda completa
// ============================================================
function testCalculations() {
  console.log('🧪 Testing Game Mechanics Calculator...\n');

  // Test 1: Betrayal Streak
  console.log('TEST 1: Betrayal Streak Penalty');
  for (let i = 0; i < 5; i++) {
    const result = GameMechanicsCalculator.calculateFinalPoints({
      basePoints: 10,
      action: 'BETRAY',
      betrayalStreak: i,
      reputation: 0
    });
    console.log(`  Racha ${i}: ${result.points} puntos (x${result.breakdown.betrayalStreakMultiplier})`);
  }

  // Test 2: Reputation Bonus
  console.log('\nTEST 2: Reputation Bonus');
  const reputations = [100, 80, 50, 0, -50, -80, -100];
  reputations.forEach(rep => {
    const bonus = GameMechanicsCalculator.getReputationBonus(rep);
    const label = GameMechanicsCalculator.getReputationLabel(rep);
    console.log(`  Reputación ${rep.toString().padStart(3)}: ${label.padEnd(15)} (x${bonus})`);
  });

  // Test 3: Fatigue Effect
  console.log('\nTEST 3: Fatigue Reduction');
  for (let i = 0; i <= 20; i += 5) {
    const reducer = GameMechanicsCalculator.calculateFatigueReducer(i);
    const result = GameMechanicsCalculator.calculateFinalPoints({
      basePoints: 10,
      action: 'BETRAY',
      fatigueLevel: i
    });
    console.log(`  Fatiga ${i.toString().padStart(2)}/20: x${reducer.toFixed(2)} = ${result.points} puntos`);
  }

  // Test 4: Complete Formula
  console.log('\nTEST 4: Fórmula Completa');
  const complexResult = GameMechanicsCalculator.calculateFinalPoints({
    basePoints: 10,
    action: 'BETRAY',
    betrayalStreak: 2,
    cooperationStreak: 0,
    fatigueLevel: 3,
    reputation: 60,
    currentRound: 8,
    totalRounds: 10,
    totalCooperations: 5,
    totalBetrayals: 3
  });

  console.log(GameMechanicsCalculator.generateReport(complexResult));
}

// ============================================================
// EXPORTAR
// ============================================================
module.exports = {
  playRound,
  getPlayerStats,
  finishGame,
  testCalculations
};

// Para ejecutar tests:
// node -e "const { testCalculations } = require('./gameMechanicsExample'); testCalculations();"
