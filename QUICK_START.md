# 🚀 Guía de Integración Rápida - Game Mechanics

## ⚡ Resumen Ejecutivo

Se han completado:
1. ✅ **Frontend**: Rules.jsx con 5 reglas, Dashboard compacto, UI épica
2. ✅ **Backend**: GameMechanicsCalculator con todas las fórmulas matemáticas
3. ✅ **Documentación**: GAME_MECHANICS.md con 300+ líneas de especificación

**Ahora necesitas**: Integrar el calculador en tus rutas reales (5-10 líneas de código)

---

## 📝 PASO 1: Verificar Archivos Creados

Asegúrate de que existan:
```
c:\prisionero\
├── backend\
│   └── src\
│       └── utils\
│           ├── gameMechanics.js        ✅ NUEVO
│           └── gameMechanicsExample.js ✅ NUEVO
├── frontend\
│   └── src\
│       └── pages\
│           ├── Rules.jsx               ✅ ACTUALIZADO
│           └── Dashboard.jsx           ✅ ACTUALIZADO
├── GAME_MECHANICS.md                   ✅ NUEVO
└── IMPLEMENTATION_SUMMARY.md           ✅ NUEVO
```

---

## 📝 PASO 2: Crear Tablas en Base de Datos

Si aún no existen, ejecuta estos SQL en tu SQLite:

```sql
-- 1. Extender tabla games
ALTER TABLE games ADD COLUMN IF NOT EXISTS reputation_p1 INT DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS reputation_p2 INT DEFAULT 0;

-- 2. Crear tabla game_rounds (historial detallado)
CREATE TABLE IF NOT EXISTS game_rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  round_number INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  action VARCHAR(10) NOT NULL, -- 'COOPERATE' or 'BETRAY'
  points_gained REAL DEFAULT 0,
  betrayal_streak INT DEFAULT 0,
  cooperation_streak INT DEFAULT 0,
  fatigue_level INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(game_id) REFERENCES games(id),
  FOREIGN KEY(player_id) REFERENCES users(id)
);

-- 3. Crear tabla player_stats (reputación global)
CREATE TABLE IF NOT EXISTS player_stats (
  user_id INTEGER PRIMARY KEY,
  total_games INT DEFAULT 0,
  total_rounds INT DEFAULT 0,
  total_cooperations INT DEFAULT 0,
  total_betrayals INT DEFAULT 0,
  reputation INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 4. Crear tabla game_states (estado actual de cada jugador en partida)
CREATE TABLE IF NOT EXISTS game_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  betrayal_streak INT DEFAULT 0,
  cooperation_streak INT DEFAULT 0,
  fatigue_level INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(game_id) REFERENCES games(id),
  FOREIGN KEY(player_id) REFERENCES users(id)
);

-- 5. Crear índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_game_rounds_game ON game_rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_player ON game_rounds(player_id);
CREATE INDEX IF NOT EXISTS idx_game_states_game ON game_states(game_id);
```

---

## 📝 PASO 3: Integrar en Rutas de Juego

### En tu archivo `backend/src/routes/game.js` (o similar):

```javascript
// Agregar al principio del archivo
const GameMechanicsCalculator = require('../utils/gameMechanics');
const db = require('../db/database'); // Ajusta según tu estructura

// ============================================================
// ENDPOINT: Jugar una ronda
// ============================================================
router.post('/game/:gameId/play', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { action } = req.body; // 'COOPERATE' o 'BETRAY'
    const playerId = req.user.id;

    // Validaciones
    if (!['COOPERATE', 'BETRAY'].includes(action)) {
      return res.status(400).json({ error: 'Acción inválida' });
    }

    // Obtener partida
    const game = await db.get(
      'SELECT * FROM games WHERE id = ? AND status = ?',
      [gameId, 'playing']
    );

    if (!game) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    // Obtener estado del jugador en la partida
    const playerState = await db.get(
      'SELECT * FROM game_states WHERE game_id = ? AND player_id = ?',
      [gameId, playerId]
    );

    // Obtener stats globales
    const playerStats = await db.get(
      'SELECT * FROM player_stats WHERE user_id = ?',
      [playerId]
    ) || {
      user_id: playerId,
      reputation: 0,
      total_cooperations: 0,
      total_betrayals: 0
    };

    // ===== CALCULAR PUNTOS CON TODAS LAS REGLAS =====
    const calculationResult = GameMechanicsCalculator.calculateFinalPoints({
      basePoints: 10,
      action,
      betrayalStreak: playerState?.betrayal_streak || 0,
      cooperationStreak: playerState?.cooperation_streak || 0,
      fatigueLevel: playerState?.fatigue_level || 0,
      reputation: playerStats?.reputation || 0,
      currentRound: game.current_round,
      totalRounds: game.total_rounds,
      totalCooperations: playerStats?.total_cooperations || 0,
      totalBetrayals: playerStats?.total_betrayals || 0
    });

    const { points, breakdown, messages } = calculationResult;

    // ===== ACTUALIZAR ESTADO DEL JUGADOR EN LA PARTIDA =====
    if (action === 'BETRAY') {
      await db.run(
        `UPDATE game_states 
         SET betrayal_streak = ?, cooperation_streak = 0, fatigue_level = ?
         WHERE game_id = ? AND player_id = ?`,
        [
          (playerState?.betrayal_streak || 0) + 1,
          Math.min(20, (playerState?.fatigue_level || 0) + 1),
          gameId,
          playerId
        ]
      );
    } else {
      await db.run(
        `UPDATE game_states 
         SET cooperation_streak = ?, betrayal_streak = 0, fatigue_level = ?
         WHERE game_id = ? AND player_id = ?`,
        [
          (playerState?.cooperation_streak || 0) + 1,
          Math.max(0, (playerState?.fatigue_level || 0) - 1),
          gameId,
          playerId
        ]
      );
    }

    // ===== GUARDAR RONDA EN HISTORIAL =====
    await db.run(
      `INSERT INTO game_rounds 
       (game_id, round_number, player_id, action, points_gained, 
        betrayal_streak, cooperation_streak, fatigue_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gameId,
        game.current_round,
        playerId,
        action,
        points,
        breakdown.betrayalStreakMultiplier === 1.0 ? 0 : 1,
        breakdown.cooperationMultiplier > 1.0 ? 1 : 0,
        breakdown.fatigueLevel
      ]
    );

    // ===== ACTUALIZAR PUNTOS TOTALES EN LA PARTIDA =====
    const playerKey = game.player1_id === playerId ? 'player1' : 'player2';
    await db.run(
      `UPDATE games SET ${playerKey}_points = ${playerKey}_points + ? WHERE id = ?`,
      [points, gameId]
    );

    // ===== RESPUESTA =====
    res.json({
      success: true,
      action,
      pointsGained: points,
      breakdown,
      messages,
      report: GameMechanicsCalculator.generateReport(calculationResult)
    });

  } catch (error) {
    console.error('Error en playRound:', error);
    res.status(500).json({ error: 'Error al procesar la jugada' });
  }
});

// ============================================================
// ENDPOINT: Obtener stats del jugador
// ============================================================
router.get('/player/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await db.get(
      'SELECT * FROM player_stats WHERE user_id = ?',
      [userId]
    );

    if (!stats) {
      return res.json({
        userId,
        reputation: 0,
        reputationLabel: '🟡 Nuevo Jugador',
        totalGames: 0,
        cooperationRate: '0%'
      });
    }

    const reputation = GameMechanicsCalculator.calculateReputation(
      stats.total_cooperations,
      stats.total_betrayals
    );

    res.json({
      userId,
      reputation,
      reputationLabel: GameMechanicsCalculator.getReputationLabel(reputation),
      reputationBonus: GameMechanicsCalculator.getReputationBonus(reputation),
      totalGames: stats.total_games,
      cooperationRate: (
        stats.total_cooperations / 
        (stats.total_cooperations + stats.total_betrayals) * 100
      ).toFixed(1) + '%',
      stats: {
        cooperations: stats.total_cooperations,
        betrayals: stats.total_betrayals,
        total: stats.total_cooperations + stats.total_betrayals
      }
    });

  } catch (error) {
    console.error('Error en getPlayerStats:', error);
    res.status(500).json({ error: 'Error al obtener stats' });
  }
});

// ============================================================
// ENDPOINT: Finalizar partida
// ============================================================
router.post('/game/:gameId/finish', async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await db.get('SELECT * FROM games WHERE id = ?', [gameId]);

    if (!game) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    // Marcar como finalizada
    await db.run('UPDATE games SET status = ? WHERE id = ?', ['finished', gameId]);

    // Actualizar reputación de ambos jugadores
    const updateRep = async (playerId) => {
      const stats = await db.get(
        'SELECT * FROM player_stats WHERE user_id = ?',
        [playerId]
      );

      if (stats) {
        const reputation = GameMechanicsCalculator.calculateReputation(
          stats.total_cooperations,
          stats.total_betrayals
        );

        await db.run(
          'UPDATE player_stats SET reputation = ? WHERE user_id = ?',
          [reputation, playerId]
        );
      }
    };

    await updateRep(game.player1_id);
    await updateRep(game.player2_id);

    res.json({
      success: true,
      message: 'Partida finalizada'
    });

  } catch (error) {
    console.error('Error en finishGame:', error);
    res.status(500).json({ error: 'Error al finalizar' });
  }
});
```

---

## 🧪 PASO 4: Testing

### Test 1: Verificar que GameMechanicsCalculator funciona
```bash
node -e "
const GMC = require('./backend/src/utils/gameMechanics');
const result = GMC.calculateFinalPoints({
  basePoints: 10,
  action: 'BETRAY',
  betrayalStreak: 2,
  fatigueLevel: 5,
  reputation: 50
});
console.log('Puntos:', result.points);
console.log('✅ Calculador funciona!');
"
```

### Test 2: Verificar que frontend carga
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev

# Navega a http://localhost:5175
# Haz login y ve a /rules para ver las nuevas reglas
```

### Test 3: Enviar una jugada de prueba
```bash
curl -X POST http://localhost:5000/api/game/1/play \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu_token>" \
  -d '{"action":"BETRAY"}'
```

---

## 📊 Ejemplo de Respuesta

Cuando un jugador hace una jugada, recibirá:

```json
{
  "success": true,
  "action": "BETRAY",
  "pointsGained": 5.6,
  "breakdown": {
    "finalAction": "BETRAY",
    "basePoints": 10,
    "betrayalStreakMultiplier": 0.75,
    "cooperationMultiplier": 1,
    "fatigueLevel": 5,
    "fatigueReducer": 0.75,
    "reputation": 50,
    "reputationLabel": "🟢 Bueno",
    "reputationBonus": 1,
    "lateGameMultiplier": 1,
    "finalPoints": 5.6
  },
  "messages": [
    "⚠️ Racha de traición (3): 75%",
    "⚠️ Estás cansado. Puntos reducidos por fatiga."
  ]
}
```

---

## ⚙️ Configuración Personalizable

Si quieres cambiar los valores:

### Racha de Traición
En `gameMechanics.js`, método `calculateBetrayalStreakMultiplier`:
```javascript
if (betrayalStreak === 2) return 0.9;  // Cambiar 0.9 a otro valor
if (betrayalStreak === 3) return 0.75; // Cambiar 0.75 a otro valor
```

### Fatiga
En `calculateFatigueReducer`:
```javascript
return Math.max(0, 1 - (fatigueLevel * 0.05)); // Cambiar 0.05
```

### Reputación Bonus
En `getReputationBonus`:
```javascript
if (reputation >= 80) return 1.2; // Cambiar 1.2
if (reputation >= -79) return 0.8; // Cambiar 0.8
```

---

## 🎯 Checklist de Implementación

- [ ] Archivos creados en backend/src/utils/
- [ ] Frontend Rules.jsx cargando sin errores
- [ ] Frontend Dashboard.jsx compacto funcionando
- [ ] SQL tables creadas en la BD
- [ ] GameMechanicsCalculator importado en rutas
- [ ] POST /api/game/:gameId/play implementado
- [ ] GET /api/player/:userId/stats implementado
- [ ] POST /api/game/:gameId/finish implementado
- [ ] Testing manual realizado
- [ ] Jugada de prueba enviada y respondió correctamente

---

## 💡 Tips de Debugging

Si algo no funciona:

1. **El calculador no carga**: Verifica que `gameMechanics.js` exista en `backend/src/utils/`
2. **Los puntos son iguales siempre**: Revisa que todos los parámetros se pasen correctamente
3. **Errores en BD**: Ejecuta los SQL de creación de tablas primero
4. **Frontend no actualiza**: Verifica que Rules.jsx y Dashboard.jsx estén guardados

---

## 📞 Soporte

Documentación completa:
- `GAME_MECHANICS.md` - Especificación técnica detallada
- `IMPLEMENTATION_SUMMARY.md` - Resumen de todo lo implementado
- `gameMechanicsExample.js` - Ejemplos completos de código

---

**Versión**: 1.0 Final  
**Fecha**: 2024  
**Estado**: ✅ Listo para integración en servidor
