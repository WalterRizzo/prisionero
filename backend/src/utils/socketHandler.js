const Game = require('../models/Game');
const User = require('../models/User');

const gameRooms = {};

const calculateScore = (decision1, decision2, payoffMatrix) => {
  const { cooperateBoth, defectBoth, cooperateDefect, defectCooperate } = payoffMatrix;

  if (decision1 === 'cooperate' && decision2 === 'cooperate') {
    return [cooperateBoth, cooperateBoth];
  }
  if (decision1 === 'defect' && decision2 === 'defect') {
    return [defectBoth, defectBoth];
  }
  if (decision1 === 'cooperate' && decision2 === 'defect') {
    return [cooperateDefect, defectCooperate];
  }
  if (decision1 === 'defect' && decision2 === 'cooperate') {
    return [defectCooperate, cooperateDefect];
  }

  return [0, 0];
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Unirse a una sala de juego
    socket.on('join-game', async (data) => {
      const { gameId, userId } = data;
      
      socket.join(gameId);
      gameRooms[gameId] = gameRooms[gameId] || [];
      gameRooms[gameId].push({ socketId: socket.id, userId });

      // Notificar a los otros jugadores
      socket.to(gameId).emit('player-joined', { userId });
    });

    // Enviar decisión
    socket.on('make-decision', async (data) => {
      const { gameId, userId, decision } = data;
      
      try {
        const juego = await Game.findOne({ gameId });
        
        // Actualizar decisión del jugador
        const playerIndex = juego.players.findIndex(p => p.userId.toString() === userId);
        if (playerIndex !== -1) {
          juego.players[playerIndex].decision = decision;
        }

        // Verificar si ambos jugadores han decidido
        if (juego.players.every(p => p.decision !== null)) {
          // Calcular puntos
          const [score1, score2] = calculateScore(
            juego.players[0].decision,
            juego.players[1].decision,
            juego.payoffMatrix
          );

          juego.players[0].score += score1;
          juego.players[1].score += score2;

          // Enviar resultados a ambos jugadores
          io.to(gameId).emit('round-result', {
            round: juego.round,
            decisions: [juego.players[0].decision, juego.players[1].decision],
            scores: [score1, score2],
            totalScores: [juego.players[0].score, juego.players[1].score]
          });

          // Pasar a la siguiente ronda
          juego.round += 1;
          juego.players.forEach(p => p.decision = null);

          // Terminar juego si se alcanza el máximo de rondas
          if (juego.round > juego.maxRounds) {
            juego.status = 'finished';
            juego.finishedAt = new Date();

            // Actualizar estadísticas de usuarios
            for (let i = 0; i < juego.players.length; i++) {
              const usuario = await User.findById(juego.players[i].userId);
              usuario.stats.gamesPlayed += 1;
              usuario.stats.totalScore += juego.players[i].score;
              
              if (juego.players[i].score > juego.players[1 - i].score) {
                usuario.stats.gamesWon += 1;
              }

              if (juego.players[i].decision === 'cooperate') {
                usuario.stats.cooperationRate = 
                  (usuario.stats.cooperationRate * (usuario.stats.gamesPlayed - 1) + 1) / usuario.stats.gamesPlayed;
              }

              await usuario.save();
            }

            io.to(gameId).emit('game-finished', {
              totalScores: [juego.players[0].score, juego.players[1].score],
              winner: juego.players[0].score > juego.players[1].score ? 0 : 1
            });
          } else {
            io.to(gameId).emit('next-round', { round: juego.round });
          }
        }

        await juego.save();
      } catch (error) {
        console.error('Error en make-decision:', error);
      }
    });

    // Desconectar
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
      
      // Limpiar salas vacías
      for (const gameId in gameRooms) {
        gameRooms[gameId] = gameRooms[gameId].filter(p => p.socketId !== socket.id);
        if (gameRooms[gameId].length === 0) {
          delete gameRooms[gameId];
        }
      }
    });
  });
};
