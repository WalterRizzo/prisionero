# 🎮 Prisoner's Dilemma - Game Mechanics Specification

## Overview
Sistema de reglas sofisticado para balancear el juego y garantizar que **traicionar siempre no sea óptimo**. El objetivo es crear una experiencia adictiva donde la psicología y la estrategia a largo plazo dominen.

---

## 1. ⚡ Penalización por Racha de Traición
**Penaliza el abuso de traiciones consecutivas**

### Regla
- **1ª traición**: 100% de puntos ganados
- **2ª traición consecutiva**: -10% de puntos
- **3ª traición consecutiva**: -25% de puntos
- **4ª o más traiciones consecutivas**: -50% de puntos

### Ejemplo
```
Ronda 1: Traiciono → Gano 10 puntos (100%)
Ronda 2: Traiciono → Gano 9 puntos (-10%)
Ronda 3: Traiciono → Gano 7.5 puntos (-25%)
Ronda 4: Traiciono → Gano 5 puntos (-50%)
Ronda 5: Traiciono → Gano 5 puntos (-50%)
Ronda 6: Coopero → Reset del contador
Ronda 7: Traiciono → Gano 10 puntos (100%) ← volvemos a empezar
```

### Implementación
```javascript
let betrayalStreak = 0;
let streakMultiplier = 1.0;

if (playerAction === 'BETRAY') {
  betrayalStreak++;
  
  if (betrayalStreak === 1) streakMultiplier = 1.0;
  else if (betrayalStreak === 2) streakMultiplier = 0.9;
  else if (betrayalStreak === 3) streakMultiplier = 0.75;
  else streakMultiplier = 0.5;
  
  // Aplicar multiplicador a puntos
  pointsGained *= streakMultiplier;
} else if (playerAction === 'COOPERATE') {
  betrayalStreak = 0; // Reset
  streakMultiplier = 1.0;
}
```

---

## 2. 👑 Reputación Visible (Meta-Juego)
**Crea un sistema autorregulador donde el historial define tu futuro**

### Cálculo de Reputación
```
Reputación = (Cooperaciones - Traiciones * 1.5) / Total Rondas Jugadas
Rango: -100 (Traidor Puro) a +100 (Cooperador Puro)
```

### Efectos por Rango
| Reputación | Etiqueta | Emparejamiento | Multiplicador de Puntos |
|------------|----------|---|---|
| +80 a +100 | ⭐ Confiable | Jugadores honestos | x1.2 |
| +50 a +79 | 🟢 Bueno | Mixto | x1.0 |
| -50 a +49 | 🟡 Neutro | Mixto | x1.0 |
| -79 a -50 | 🟠 Sospechoso | Más traidores | x0.8 |
| -100 a -80 | 🔴 Traidor | Traidores puros | x0.8 |

### Visibilidad
- Mostrar reputación del rival **ANTES** de empezar la partida
- Permite tomar decisiones estratégicas basadas en el historial
- Los traidores conocen que jugarán con otros traidores

### Implementación
```javascript
function calculateReputation(userId, games) {
  let coopCount = 0;
  let betrayalCount = 0;
  
  games.forEach(game => {
    game.rounds.forEach(round => {
      if (round.playerAction === 'COOPERATE') coopCount++;
      else if (round.playerAction === 'BETRAY') betrayalCount++;
    });
  });
  
  const total = coopCount + betrayalCount;
  if (total === 0) return 0;
  
  const reputation = ((coopCount - (betrayalCount * 1.5)) / total) * 100;
  return Math.max(-100, Math.min(100, reputation));
}

function getReputationBonus(reputation) {
  if (reputation >= 80) return 1.2;
  if (reputation >= 50) return 1.0;
  if (reputation >= -50) return 1.0;
  if (reputation >= -79) return 0.8;
  return 0.8;
}
```

---

## 3. 😴 Fatiga de Traición
**Sistema de debuff acumulativo que simula el cansancio por traiciones**

### Mecánica
- **Acumulación**: Cada traición suma 1 punto de fatiga
- **Reducción**: -1 punto de fatiga por ronda de cooperación
- **Efecto en puntos**: `Puntos Finales = Puntos Ganados * (1 - Fatiga * 0.05)`
- **Efecto en cooldown**: Aumenta tiempo entre rondas (visual)
- **Tope**: Máximo 20 puntos de fatiga

### Ejemplo
```
Ronda 1: Traiciono → Fatiga: 1 → Gano 10 * (1 - 0.05) = 9.5 puntos
Ronda 2: Traiciono → Fatiga: 2 → Gano 9 * (1 - 0.10) = 8.1 puntos
Ronda 3: Traiciono → Fatiga: 3 → Gano 8 * (1 - 0.15) = 6.8 puntos
Ronda 4: Coopero → Fatiga: 2 → Gano 8 * (1 - 0.10) = 7.2 puntos
```

### Mensajes al jugador
- Fatiga 5+: "⚠️ Estás cansado. Tus traiciones generan menos puntos."
- Fatiga 10+: "⚠️⚠️ Fatiga crítica. Reduce tu frecuencia de traiciones."
- Fatiga 15+: "🔴 Estás exhausto. Solo cooperación recuperará tu forma."

### Implementación
```javascript
let fatigueLevel = 0;

if (playerAction === 'BETRAY') {
  fatigueLevel = Math.min(20, fatigueLevel + 1);
  pointsGained *= (1 - fatigueLevel * 0.05);
} else if (playerAction === 'COOPERATE') {
  fatigueLevel = Math.max(0, fatigueLevel - 1);
}
```

---

## 4. 🎁 Bonus por Cooperación Sostenida
**Incentiva la cooperación consistente con recompensas exponenciales**

### Estructura de Bonuses
- **3 cooperaciones seguidas**: +20% bonus de puntos
- **5 cooperaciones seguidas**: Multiplicador x1.5 en la siguiente ronda
- **8 cooperaciones seguidas**: 
  - Logro desbloqueado: "🏅 Pacifista"
  - +50 puntos bonus
  - Mostrar notificación épica

### Ejemplo
```
Ronda 1-2: Coopero, Coopero
Ronda 3: Coopero → BONUS! +20% puntos → 10 * 1.2 = 12 puntos ✨
Ronda 4-5: Coopero, Coopero
Ronda 6: Coopero → COMBO x1.5 activado para siguiente ronda 🔥
Ronda 7: Coopero → 10 * 1.5 = 15 puntos ⚡
Ronda 8-10: Coopero, Coopero, Coopero
Ronda 11: Traiciono → 🏅 LOGRO: "Pacifista" + 50 puntos bonus
```

### Implementación
```javascript
let cooperationStreak = 0;
let cooperationMultiplier = 1.0;

if (playerAction === 'COOPERATE') {
  cooperationStreak++;
  
  if (cooperationStreak === 3) {
    bonusPoints += pointsGained * 0.2;
    notify("🎁 3 Cooperaciones! +20% bonus");
  }
  if (cooperationStreak === 5) {
    cooperationMultiplier = 1.5;
    notify("🔥 COMBO x1.5 activado!");
  }
  if (cooperationStreak === 8) {
    unlockedAchievements.push("Pacifista");
    bonusPoints += 50;
    notify("🏅 LOGRO DESBLOQUEADO: Pacifista!");
  }
  
  pointsGained *= cooperationMultiplier;
} else if (playerAction === 'BETRAY') {
  cooperationStreak = 0;
  cooperationMultiplier = 1.0;
}
```

---

## 5. 🔥 Penalización de Últimas Rondas (Late-Game Penalty)
**Previene el clásico "cooperar 8 rondas, traicionar al final"**

### Regla
**En las últimas 2 rondas de la partida:**
- Si tu % total de cooperación < 40%
- Tus traiciones valen solo 50% de los puntos normales

### Cálculo
```javascript
const lastRoundIndex = totalRounds - 1;
const secondLastRoundIndex = totalRounds - 2;

if (currentRoundIndex >= secondLastRoundIndex) {
  const cooperationRate = cooperations / totalRounds;
  
  if (cooperationRate < 0.4 && playerAction === 'BETRAY') {
    // Penalizar traiciones
    pointsGained *= 0.5;
    notify("🚫 Última ronda penalty: traición vale 50%");
  }
}
```

### Impacto Estratégico
- Obliga a ser consistente si querés ganar
- No podes cooperar 8 rondas y luego "free for all" final
- Los traidores puros necesitan serlo DESDE EL INICIO

---

## 6. 🎯 Sistema de Scoring Combinado

### Fórmula General de Puntos por Ronda
```
PUNTOS FINALES = (BASE_POINTS * streakMultiplier * cooperationMultiplier)
                 * (1 - fatigueLevel * 0.05)
                 * reputationBonus
                 * lateGamePenalty

Donde:
- streakMultiplier: 1.0 / 0.9 / 0.75 / 0.5 (por racha de traición)
- cooperationMultiplier: 1.0 / 1.2 / 1.5 (por bonus de cooperación)
- fatigueLevel: 0-20 (reduce 5% por punto)
- reputationBonus: 0.8 / 1.0 / 1.2 (según reputación)
- lateGamePenalty: 0.5 (si en últimas 2 rondas y coop% < 40%)
```

### Ejemplo Completo
```
Contexto:
- BASE_POINTS = 10
- Reputación: +60 (bonus 1.0)
- Fatiga: 3
- Racha de traición: 1ª (multiplier 1.0)
- Bonificación cooperación: ninguna (multiplier 1.0)
- No es últimas rondas

Cálculo:
PUNTOS = (10 * 1.0 * 1.0) * (1 - 3 * 0.05) * 1.0 * 1.0
       = 10 * 0.85
       = 8.5 puntos ✓
```

---

## 7. 📊 Backend Implementation Roadmap

### Base de datos - Tablas necesarias
```sql
-- Extender tabla games
ALTER TABLE games ADD COLUMN (
  reputation_p1 INT DEFAULT 0,
  reputation_p2 INT DEFAULT 0,
  final_points_p1 INT,
  final_points_p2 INT
);

-- Nueva tabla: game_rounds (detalles por ronda)
CREATE TABLE game_rounds (
  id INTEGER PRIMARY KEY,
  game_id INTEGER NOT NULL,
  round_number INTEGER NOT NULL,
  player1_action VARCHAR(10), -- 'COOPERATE' o 'BETRAY'
  player2_action VARCHAR(10),
  player1_points INT,
  player2_points INT,
  player1_betrayal_streak INT,
  player1_fatigue INT,
  player2_betrayal_streak INT,
  player2_fatigue INT,
  FOREIGN KEY(game_id) REFERENCES games(id)
);

-- Nueva tabla: player_stats (para reputación y historial)
CREATE TABLE player_stats (
  user_id INTEGER PRIMARY KEY,
  total_games INT DEFAULT 0,
  total_rounds INT DEFAULT 0,
  total_cooperations INT DEFAULT 0,
  total_betrayals INT DEFAULT 0,
  reputation INT DEFAULT 0,
  last_updated TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### Endpoints a crear/modificar
```
POST /api/game/:gameId/play
  Input: { action: 'COOPERATE' | 'BETRAY' }
  Lógica:
    - Validar acción
    - Calcular puntos con todas las reglas
    - Actualizar stats de ronda
    - Registrar en game_rounds
    - Si partida terminó, actualizar reputación

GET /api/game/:gameId/status
  Output: {
    roundNumber,
    player1: { 
      username, 
      reputation, 
      points, 
      fatigueLevel 
    },
    player2: { ... },
    resultados: [...]
  }

GET /api/player/:userId/stats
  Output: {
    reputation,
    totalGames,
    totalCooperations,
    totalBetrayals,
    cooperationRate,
    recentGames: [...]
  }
```

### Lógica en servidor
```javascript
// Pseudo-código para completar

async function playRound(gameId, playerId, action) {
  const game = await getGame(gameId);
  const player = await getPlayer(playerId);
  const playerStats = await getPlayerStats(playerId);
  
  // 1. Validar
  if (game.status !== 'playing') throw new Error('Game not active');
  
  // 2. Calcular multiplicadores
  const betrayalMultiplier = calculateBetrayalMultiplier(player.betrayalStreak);
  const cooperationMultiplier = calculateCooperationMultiplier(player.cooperationStreak);
  const fatigueReducer = 1 - (player.fatigueLevel * 0.05);
  const reputationBonus = calculateReputationBonus(playerStats.reputation);
  const lateGameMultiplier = calculateLateGamePenalty(game, player);
  
  // 3. Calcular puntos
  let basePoints = 10; // Ajustar según ronda
  let finalPoints = basePoints * betrayalMultiplier * cooperationMultiplier 
                    * fatigueReducer * reputationBonus * lateGameMultiplier;
  
  // 4. Actualizar estado del jugador
  if (action === 'BETRAY') {
    player.betrayalStreak++;
    player.fatigueLevel = Math.min(20, player.fatigueLevel + 1);
    player.cooperationStreak = 0;
  } else {
    player.cooperationStreak++;
    player.fatigueLevel = Math.max(0, player.fatigueLevel - 1);
    player.betrayalStreak = 0;
    checkCooperationBonuses(player);
  }
  
  // 5. Guardar ronda
  await saveGameRound(gameId, playerId, {
    action,
    points: finalPoints,
    betrayalStreak: player.betrayalStreak,
    fatigueLevel: player.fatigueLevel
  });
  
  // 6. Si partida terminó, actualizar reputación global
  if (game.status === 'finished') {
    await updatePlayerReputation(playerId);
  }
  
  return { points: finalPoints, game: updatedGame };
}
```

---

## 8. 📈 Validación y Testing

### Test Cases
```javascript
// Test 1: Betrayal Streak Penalty
assert(calculateMultiplier(1) === 1.0);   // 1ª traición
assert(calculateMultiplier(2) === 0.9);   // 2ª traición
assert(calculateMultiplier(3) === 0.75);  // 3ª traición
assert(calculateMultiplier(4) === 0.5);   // 4ª+ traición

// Test 2: Reputation Bonus
assert(getReputationBonus(100) === 1.2);   // +80 a +100
assert(getReputationBonus(50) === 1.0);    // +50 a +79
assert(getReputationBonus(-100) === 0.8);  // -100 a -80

// Test 3: Fatigue Reduction
assert(fatigueReducer(0) === 1.0);   // Sin fatiga
assert(fatigueReducer(5) === 0.75);  // 5 de fatiga
assert(fatigueReducer(20) === 0.0);  // Máxima fatiga

// Test 4: Late Game Penalty
const game = { totalRounds: 10, currentRound: 9, cooperationRate: 0.3 };
assert(lateGamePenalty(game) === 0.5);  // Penalizado
```

---

## 9. 🎮 UI/UX Integration

### Pantalla Game.jsx - Elementos a mostrar
- Reputación del rival (antes de elegir)
- Indicador de fatiga (debuff visual)
- Contador de racha de traiciones
- Bonificador de cooperación activo
- Notificación de logros (cuando se desbloquean)
- Gráfico de puntos con fórmula desglosada

### Pantalla Rules.jsx ✅
- Ya implementada con 5 secciones
- Mostrar ejemplos y casos de uso

---

## 10. 🏁 Balance Final

### Estrategias Ganadoras
- **Cooperador Puro**: Gana consistentemente con x1.2 bonus (reputación)
- **Traidor Estratégico**: Traiciones ocasionales + cooperación al azar
- **Adaptativo**: Lee al rival y cambia estrategia

### Estrategias Perdedoras
- **Traidor Puro**: Recibe x0.8 penalty + fatiga + racha penalty
- **Impredecible Errático**: Confunde al rival pero no ganancia óptima

---

## 📝 Changelog

### v1.0 (Current)
- ✅ Penalización por racha de traición
- ✅ Reputación visible
- ✅ Fatiga de traición
- ✅ Bonus por cooperación sostenida
- ✅ Penalización de últimas rondas
- ✅ Página Rules.jsx con explicaciones

### v1.1 (Próximo)
- Backend implementation de todas las reglas
- API endpoints para stats y reputación
- Testing automatizado

---

**Documento creado para balance del juego Prisoner's Dilemma**
**Última actualización: 2024**
