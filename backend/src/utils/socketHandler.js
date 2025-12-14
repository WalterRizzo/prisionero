// ============================================
// TRUST OR BETRAY - Socket Handler
// Multijugador Online en Tiempo Real
// ============================================

// Almacenamiento en memoria (para MVP)
const onlinePlayers = new Map();
const activeGames = new Map();
const gameInvites = new Map();
const roundTimers = new Map(); // Timers para timeout de rondas

const ROUND_TIMEOUT = 15000; // 15 segundos para elegir

module.exports = (io) => {
  // Configurar heartbeat para mantener conexiones vivas
  io.engine.on('initial_headers', (headers, req) => {
    headers['Connection'] = 'keep-alive';
  });

  // Ping periódico a todos los clientes
  setInterval(() => {
    io.emit('ping', { timestamp: Date.now() });
  }, 25000); // cada 25 segundos

  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // ENTRAR AL LOBBY
    socket.on('join-lobby', (data) => {
      const { playerName } = data;
      
      onlinePlayers.set(socket.id, {
        id: socket.id,
        name: playerName.toUpperCase(),
        status: 'online',
        joinedAt: Date.now()
      });

      console.log(playerName + ' entro al lobby');
      broadcastOnlinePlayers(io);
      
      socket.emit('lobby-joined', { 
        success: true, 
        playerId: socket.id,
        playerName: playerName.toUpperCase()
      });
    });

    // INVITAR A JUGAR
    socket.on('invite-player', (data) => {
      const { targetSocketId } = data;
      const inviter = onlinePlayers.get(socket.id);
      const target = onlinePlayers.get(targetSocketId);

      if (!inviter || !target) {
        socket.emit('invite-error', { message: 'Jugador no encontrado' });
        return;
      }

      if (target.status !== 'online') {
        socket.emit('invite-error', { message: 'Jugador no disponible' });
        return;
      }

      const gameId = 'game-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      gameInvites.set(gameId, {
        from: { id: socket.id, name: inviter.name },
        to: { id: targetSocketId, name: target.name },
        gameId: gameId,
        createdAt: Date.now()
      });

      inviter.status = 'waiting';
      target.status = 'waiting';
      broadcastOnlinePlayers(io);

      io.to(targetSocketId).emit('game-invite', {
        gameId: gameId,
        fromName: inviter.name,
        fromId: socket.id
      });

      socket.emit('invite-sent', { 
        gameId: gameId, 
        toName: target.name 
      });

      console.log(inviter.name + ' invito a ' + target.name);
    });

    // UNIRSE A UN JUEGO EN CURSO (para reconexión o nueva página)
    socket.on('join-game', (data) => {
      const { gameId, playerName } = data;
      console.log('🎯 join-game recibido:', { gameId, playerName, socketId: socket.id });
      console.log('🎯 Partidas activas:', Array.from(activeGames.keys()));
      
      let game = activeGames.get(gameId);
      
      // Si la partida no existe, intentar crearla con los datos del localStorage
      if (!game) {
        console.log('⚠️ Partida no existe, creándola...');
        // Crear partida nueva
        game = {
          id: gameId,
          players: [],
          round: 1,
          maxRounds: 10,
          status: 'waiting',
          history: []
        };
        activeGames.set(gameId, game);
      }
      
      // Buscar al jugador por nombre
      let playerIndex = game.players.findIndex(function(p) { 
        return p.name === playerName.toUpperCase(); 
      });
      
      // Si el jugador no existe en la partida, agregarlo
      if (playerIndex === -1) {
        game.players.push({
          id: socket.id,
          name: playerName.toUpperCase(),
          score: 0,
          move: null
        });
        playerIndex = game.players.length - 1;
        console.log('➕ Jugador agregado a la partida:', playerName.toUpperCase());
      } else {
        // Actualizar el socket ID del jugador existente
        game.players[playerIndex].id = socket.id;
      }
      
      // Unir al socket al room del juego
      socket.join(gameId);
      
      console.log('✅ ' + playerName + ' unido al juego ' + gameId + ' (socket: ' + socket.id + ')');
      console.log('👥 Jugadores en partida:', game.players.map(p => p.name));
      
      // Enviar estado actual del juego
      socket.emit('game-joined', {
        gameId: gameId,
        round: game.round,
        players: game.players.map(function(p) {
          return { id: p.id, name: p.name, score: p.score };
        }),
        yourIndex: playerIndex
      });
      
      // Si hay 2 jugadores y la partida estaba esperando, iniciarla
      if (game.players.length === 2 && game.status === 'waiting') {
        game.status = 'playing';
        console.log('🎮 Partida lista con 2 jugadores! Iniciando...');
        
        io.to(gameId).emit('game-ready', {
          gameId: gameId,
          players: game.players.map(function(p) {
            return { id: p.id, name: p.name };
          }),
          round: 1
        });
        
        // Iniciar timer para la primera ronda
        startRoundTimer(io, gameId);
      }
    });

    // ACEPTAR INVITACION
    socket.on('accept-invite', (data) => {
      const { gameId } = data;
      const invite = gameInvites.get(gameId);

      if (!invite) {
        socket.emit('invite-error', { message: 'Invitacion expirada' });
        return;
      }

      activeGames.set(gameId, {
        id: gameId,
        players: [
          { id: invite.from.id, name: invite.from.name, score: 0, move: null },
          { id: invite.to.id, name: invite.to.name, score: 0, move: null }
        ],
        round: 1,
        maxRounds: 10,
        status: 'playing',
        history: []
      });

      const p1 = onlinePlayers.get(invite.from.id);
      const p2 = onlinePlayers.get(invite.to.id);
      if (p1) p1.status = 'playing';
      if (p2) p2.status = 'playing';
      broadcastOnlinePlayers(io);

      const fromSocket = io.sockets.sockets.get(invite.from.id);
      const toSocket = io.sockets.sockets.get(invite.to.id);
      if (fromSocket) fromSocket.join(gameId);
      if (toSocket) toSocket.join(gameId);

      io.to(gameId).emit('game-start', {
        gameId: gameId,
        players: [
          { id: invite.from.id, name: invite.from.name },
          { id: invite.to.id, name: invite.to.name }
        ],
        round: 1,
        maxRounds: 10
      });

      // Iniciar timer para la primera ronda
      startRoundTimer(io, gameId);

      gameInvites.delete(gameId);
      console.log('Partida iniciada: ' + invite.from.name + ' vs ' + invite.to.name);
    });

    // RECHAZAR INVITACION
    socket.on('reject-invite', (data) => {
      const { gameId } = data;
      const invite = gameInvites.get(gameId);

      if (invite) {
        const p1 = onlinePlayers.get(invite.from.id);
        const p2 = onlinePlayers.get(invite.to.id);
        if (p1) p1.status = 'online';
        if (p2) p2.status = 'online';
        broadcastOnlinePlayers(io);

        io.to(invite.from.id).emit('invite-rejected', {
          byName: invite.to.name
        });

        gameInvites.delete(gameId);
      }
    });

    // HACER MOVIMIENTO
    socket.on('make-move', (data) => {
      const { gameId, move } = data;
      const game = activeGames.get(gameId);

      if (!game) {
        socket.emit('game-error', { message: 'Partida no encontrada' });
        return;
      }

      const playerIndex = game.players.findIndex(function(p) { return p.id === socket.id; });
      if (playerIndex === -1) return;

      // Evitar movimientos duplicados
      if (game.players[playerIndex].move !== null) return;

      game.players[playerIndex].move = move;

      socket.to(gameId).emit('opponent-moved', { 
        playerName: game.players[playerIndex].name 
      });

      console.log(game.players[playerIndex].name + ' eligio: ' + move);

      const allMoved = game.players.every(function(p) { return p.move !== null; });
      if (allMoved) {
        // Cancelar timer si ambos eligieron a tiempo
        clearRoundTimer(gameId);
        processRound(io, game);
      }
    });

    // ABANDONAR PARTIDA
    socket.on('abandon-game', (data) => {
      const { gameId } = data;
      const game = activeGames.get(gameId);

      if (game) {
        const abandoner = game.players.find(function(p) { return p.id === socket.id; });
        const winner = game.players.find(function(p) { return p.id !== socket.id; });

        if (winner) {
          io.to(winner.id).emit('opponent-abandoned', {
            winnerName: winner.name,
            abandonerName: abandoner ? abandoner.name : 'Oponente'
          });
        }

        endGame(io, game, winner ? winner.id : null);
      }
    });

    // DESCONEXION
    socket.on('disconnect', () => {
      const player = onlinePlayers.get(socket.id);
      
      if (player) {
        console.log(player.name + ' se desconecto');

        for (const [gameId, game] of activeGames) {
          const inGame = game.players.find(function(p) { return p.id === socket.id; });
          if (inGame) {
            const opponent = game.players.find(function(p) { return p.id !== socket.id; });
            if (opponent) {
              io.to(opponent.id).emit('opponent-disconnected', {
                opponentName: inGame.name
              });
            }
            endGame(io, game);
            break;
          }
        }

        for (const [inviteId, invite] of gameInvites) {
          if (invite.from.id === socket.id || invite.to.id === socket.id) {
            const otherId = invite.from.id === socket.id ? invite.to.id : invite.from.id;
            const otherPlayer = onlinePlayers.get(otherId);
            if (otherPlayer) otherPlayer.status = 'online';
            io.to(otherId).emit('invite-cancelled', { reason: 'Jugador desconectado' });
            gameInvites.delete(inviteId);
          }
        }

        onlinePlayers.delete(socket.id);
        broadcastOnlinePlayers(io);
      }
    });
  });

  // ==========================================
  // FUNCIONES DE TIMER PARA TIMEOUT
  // ==========================================
  function startRoundTimer(io, gameId) {
    // Cancelar timer previo si existe
    clearRoundTimer(gameId);
    
    const timer = setTimeout(function() {
      const game = activeGames.get(gameId);
      if (!game) {
        console.log('⚠️ Partida expiró antes de procesar timeout:', gameId);
        return;
      }
      
      console.log('⏱️ TIMEOUT en partida ' + gameId + ' ronda ' + game.round);
      
      // Asignar 'betray' (timeout) a quien no eligió
      game.players.forEach(function(p) {
        if (p.move === null) {
          p.move = 'timeout';
          console.log(p.name + ' no eligió - TIMEOUT automático a traición');
        }
      });
      
      // Procesar la ronda inmediatamente
      console.log('🔄 Procesando ronda después de timeout...');
      processRound(io, game);
    }, ROUND_TIMEOUT);
    
    roundTimers.set(gameId, timer);
    console.log('✅ Timer iniciado para gameId:', gameId);
  }
  
  function clearRoundTimer(gameId) {
    const existingTimer = roundTimers.get(gameId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      roundTimers.delete(gameId);
    }
  }

  function broadcastOnlinePlayers(io) {
    const playersList = [];
    for (const [id, data] of onlinePlayers) {
      playersList.push({
        id: id,
        name: data.name,
        status: data.status,
        joinedAt: data.joinedAt
      });
    }
    io.emit('players-online', { players: playersList });
  }

  function processRound(io, game) {
    const p1 = game.players[0];
    const p2 = game.players[1];

    // ⚠️ VALIDACIÓN: Verificar que ambos jugadores existan
    if (!p1 || !p2) {
      console.log('⚠️ Error: Faltan jugadores en la partida, cancelando ronda');
      return;
    }

    var p1Score = 0;
    var p2Score = 0;
    var resultType = '';
    var p1Timeout = p1.move === 'timeout';
    var p2Timeout = p2.move === 'timeout';

    // Convertir timeout a betray para cálculos
    var p1Move = p1Timeout ? 'betray' : p1.move;
    var p2Move = p2Timeout ? 'betray' : p2.move;

    // Penalización extra por timeout: -1 punto
    if (p1Timeout) p1Score -= 1;
    if (p2Timeout) p2Score -= 1;

    if (p1Move === 'trust' && p2Move === 'trust') {
      p1Score += 2;
      p2Score += 2;
      resultType = 'both-trust';
    } else if (p1Move === 'trust' && p2Move === 'betray') {
      p1Score += -1;
      p2Score += 3;
      resultType = p2Timeout ? 'p2-timeout' : 'p1-betrayed';
    } else if (p1Move === 'betray' && p2Move === 'trust') {
      p1Score += 3;
      p2Score += -1;
      resultType = p1Timeout ? 'p1-timeout' : 'p2-betrayed';
    } else {
      // Ambos traicionan (o timeout)
      if (p1Timeout && p2Timeout) {
        resultType = 'both-timeout';
      } else if (p1Timeout) {
        resultType = 'p1-timeout';
      } else if (p2Timeout) {
        resultType = 'p2-timeout';
      } else {
        resultType = 'both-betray';
      }
    }

    p1.score += p1Score;
    p2.score += p2Score;

    game.history.push({
      round: game.round,
      p1Move: p1.move,
      p2Move: p2.move,
      p1Score: p1Score,
      p2Score: p2Score,
      p1Timeout: p1Timeout,
      p2Timeout: p2Timeout
    });

    io.to(game.id).emit('round-result', {
      round: game.round,
      moves: { p1: p1.move, p2: p2.move },
      scores: { p1: p1Score, p2: p2Score },
      totalScores: { p1: p1.score, p2: p2.score },
      resultType: resultType,
      timeouts: { p1: p1Timeout, p2: p2Timeout },
      players: [
        { id: p1.id, name: p1.name, move: p1.move, scoreChange: p1Score, totalScore: p1.score, timeout: p1Timeout },
        { id: p2.id, name: p2.name, move: p2.move, scoreChange: p2Score, totalScore: p2.score, timeout: p2Timeout }
      ]
    });

    game.round++;
    p1.move = null;
    p2.move = null;

    if (game.round > game.maxRounds) {
      setTimeout(function() {
        clearRoundTimer(game.id);
        
        var winner = null;
        if (p1.score > p2.score) {
          winner = p1;
        } else if (p2.score > p1.score) {
          winner = p2;
        }
        
        io.to(game.id).emit('game-over', {
          winner: winner ? { id: winner.id, name: winner.name, score: winner.score } : null,
          isDraw: !winner,
          finalScores: { p1: p1.score, p2: p2.score },
          players: [
            { id: p1.id, name: p1.name, score: p1.score },
            { id: p2.id, name: p2.name, score: p2.score }
          ],
          history: game.history
        });

        endGame(io, game);
      }, 3000);
    } else {
      setTimeout(function() {
        io.to(game.id).emit('new-round', { round: game.round });
        // Iniciar timer para la nueva ronda
        startRoundTimer(io, game.id);
      }, 3000);
    }
  }

  function endGame(io, game, winnerId) {
    // Limpiar timer si existe
    clearRoundTimer(game.id);
    
    for (var i = 0; i < game.players.length; i++) {
      var p = onlinePlayers.get(game.players[i].id);
      if (p) p.status = 'online';
    }
    
    activeGames.delete(game.id);
    broadcastOnlinePlayers(io);
  }
};
