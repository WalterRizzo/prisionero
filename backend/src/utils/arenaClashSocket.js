// Socket.IO Events para Arena Clash Battle System
const MatchmakingQueue = require('./matchmakingQueue');
const { calculateDamage, calculateEloChange, determineWinner } = require('./arenaClashUtils');
const db = require('../db/database');

// Instancia global de matchmaking
const matchmaking = new MatchmakingQueue();

// Cleanup cada 5 minutos
setInterval(() => {
  matchmaking.cleanup();
  console.log('🧹 Matchmaking cleanup ejecutado');
}, 300000);

const setupArenaClashEvents = (io) => {
  const arenaNamespace = io.of('/arena');

  arenaNamespace.on('connection', (socket) => {
    console.log(`⚔️ Jugador conectado a Arena: ${socket.id}`);

    // EVENTO: Unirse a la cola
    socket.on('queue-for-match', (data) => {
      const { username, elo, userId } = data;

      console.log(`📍 ${username} busca rival (ELO: ${elo})`);

      // Agregar a la cola
      matchmaking.addToQueue(socket, { username, elo, userId });

      // Notificar al cliente que está esperando
      socket.emit('queue-joined', {
        message: 'Esperando rival...',
        queuePosition: matchmaking.queue.length
      });
    });

    // EVENTO: Jugar una carta
    socket.on('play-card', (data) => {
      const { matchId, cardId, lane, playerSide } = data;

      const match = matchmaking.getMatch(matchId);
      if (!match) return;

      const isP1 = playerSide === 'p1';
      const player = isP1 ? match.p1 : match.p2;
      const opponent = isP1 ? match.p2 : match.p1;

      // Validar que la carta existe en la mano
      if (!player.hand.includes(cardId)) {
        socket.emit('error', { message: 'No tienes esa carta' });
        return;
      }

      // Remover carta de la mano
      player.hand = player.hand.filter(c => c !== cardId);
      player.cardsPlayed++;
      player.field[lane] = cardId;
      player.hasPlayed = true;

      // Registrar el movimiento
      match.moves.push({
        round: match.round,
        player: playerSide,
        cardId,
        lane,
        timestamp: Date.now()
      });

      console.log(`🃏 ${player.username} jugó carta ${cardId} en carril ${lane}`);

      // Notificar al rival
      const opponentSocketId = isP1 ? match.p2.socketId : match.p1.socketId;
      io.to(opponentSocketId).emit('opponent-played', {
        cardId,
        lane,
        username: player.username
      });

      // Si ambos jugaron, procesar ronda
      if (player.hasPlayed && opponent.hasPlayed) {
        processRound(io, match, matchmaking);
      }
    });

    // EVENTO: Desconexión
    socket.on('disconnect', () => {
      console.log(`❌ Jugador desconectado: ${socket.id}`);
      matchmaking.removeFromQueue(socket.id);
    });
  });

  // Devolver el matchmaking para uso en otros lugares
  return matchmaking;
};

// Procesar una ronda
const processRound = (io, match, matchmaking) => {
  const p1Card = match.p1.field[0]; // Simplificado: usar solo carril 0
  const p2Card = match.p2.field[0];

  console.log(`⚔️ PROCESANDO RONDA ${match.round}: P1 carta ${p1Card} vs P2 carta ${p2Card}`);

  // Calcular daño (simplificado)
  const p1Damage = p1Card ? (p1Card * 2) : 0; // Damage = cardId * 2
  const p2Damage = p2Card ? (p2Card * 2) : 0;

  // Aplicar daño
  match.p2.health -= p1Damage;
  match.p1.health -= p2Damage;

  // Enviar update a ambos jugadores
  io.to(match.p1.socketId).emit('round-result', {
    round: match.round,
    p1Damage,
    p2Damage,
    p1Health: Math.max(0, match.p1.health),
    p2Health: Math.max(0, match.p2.health),
    p1Card,
    p2Card
  });

  io.to(match.p2.socketId).emit('round-result', {
    round: match.round,
    p1Damage,
    p2Damage,
    p1Health: Math.max(0, match.p1.health),
    p2Health: Math.max(0, match.p2.health),
    p1Card,
    p2Card
  });

  // Reset para siguiente ronda
  match.p1.hasPlayed = false;
  match.p2.hasPlayed = false;
  match.p1.field = [null, null, null];
  match.p2.field = [null, null, null];

  // Verificar ganador
  if (match.p1.health <= 0 || match.p2.health <= 0) {
    const winnerId = match.p1.health > match.p2.health ? match.p1.userId : match.p2.userId;
    finishMatch(io, match, winnerId, matchmaking);
  } else if (match.round >= match.maxRounds) {
    // Máximo de rondas alcanzado
    const winnerId = match.p1.health > match.p2.health ? match.p1.userId : match.p2.userId;
    finishMatch(io, match, winnerId, matchmaking);
  } else {
    // Siguiente ronda
    match.round++;
    
    io.to(match.p1.socketId).emit('new-round', { round: match.round, timer: 45 });
    io.to(match.p2.socketId).emit('new-round', { round: match.round, timer: 45 });
  }
};

// Finalizar partida
const finishMatch = (io, match, winnerId, matchmaking) => {
  const winner = match.p1.userId === winnerId ? match.p1 : match.p2;
  const loser = match.p1.userId === winnerId ? match.p2 : match.p1;

  // Calcular cambio de ELO
  const { winnerChange, loserChange } = calculateEloChange(winner.elo, loser.elo);

  // Actualizar ELO en base de datos
  try {
    db.prepare('UPDATE arena_clash_users SET elo = elo + ?, wins = wins + 1 WHERE user_id = ?')
      .run(winnerChange, winner.userId);
    
    db.prepare('UPDATE arena_clash_users SET elo = elo + ?, losses = losses + 1 WHERE user_id = ?')
      .run(loserChange, loser.userId);

    // Guardar match
    db.prepare(`
      INSERT INTO arena_clash_matches 
      (match_id, player1_id, player2_id, winner_id, duration_seconds, p1_elo_change, p2_elo_change, status)
      SELECT ?, id, ?, ?, ?, ?, ?, 'finished'
      FROM arena_clash_users 
      WHERE username = ?
    `).run(
      match.id,
      match.p2.userId,
      winner.userId,
      Math.floor((Date.now() - match.startedAt) / 1000),
      match.p1.userId === winner.userId ? winnerChange : loserChange,
      match.p1.userId === winner.userId ? loserChange : winnerChange,
      match.p2.username
    );
  } catch (err) {
    console.error('❌ Error guardando match:', err);
  }

  // Finalizar match
  matchmaking.endMatch(match.id, winnerId, match.p1.health, match.p2.health);

  // Enviar resultado
  io.to(match.p1.socketId).emit('battle-end', {
    winner: winner.userId === match.p1.userId,
    eloChange: match.p1.userId === winner.userId ? winnerChange : loserChange,
    newElo: match.p1.elo + (match.p1.userId === winner.userId ? winnerChange : loserChange),
    reward: match.p1.userId === winner.userId ? 500 : 100
  });

  io.to(match.p2.socketId).emit('battle-end', {
    winner: winner.userId === match.p2.userId,
    eloChange: match.p2.userId === winner.userId ? winnerChange : loserChange,
    newElo: match.p2.elo + (match.p2.userId === winner.userId ? winnerChange : loserChange),
    reward: match.p2.userId === winner.userId ? 500 : 100
  });

  console.log(`🏆 MATCH FINALIZADO: ${winner.username} (+${winnerChange} ELO) vs ${loser.username} (${loserChange} ELO)`);
};

module.exports = { setupArenaClashEvents, matchmaking };
