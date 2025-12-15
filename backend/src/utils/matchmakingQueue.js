// Sistema de Matchmaking y Cola de Espera para Arena Clash

class MatchmakingQueue {
  constructor() {
    this.queue = []; // Array de jugadores esperando
    this.activeMatches = new Map(); // matchId -> { p1, p2, gameState }
    this.matchHistory = new Map(); // userId -> [matches]
  }

  // Agregar jugador a la cola
  addToQueue(socket, userData) {
    const player = {
      socketId: socket.id,
      username: userData.username,
      elo: userData.elo,
      userId: userData.userId,
      joinedAt: Date.now()
    };

    this.queue.push(player);
    console.log(`👤 ${userData.username} (ELO: ${userData.elo}) se unió a la cola. Cola: ${this.queue.length}`);

    // Intentar encontrar rival
    this.tryMatchmake();
  }

  // Intentar emparejar jugadores
  tryMatchmake() {
    // Mientras haya al menos 2 jugadores, crea partidas
    while (this.queue.length >= 2) {
      // Ordenar por tiempo de llegada para ser justos (First-In, First-Out)
      this.queue.sort((a, b) => a.joinedAt - b.joinedAt);

      const p1 = this.queue.shift(); // Saca al primer jugador
      const p2 = this.queue.shift(); // Saca al segundo jugador

      // Salvaguarda: si por alguna razón son el mismo socket, devolver uno a la cola y esperar.
      if (p1.socketId === p2.socketId) {
        this.queue.unshift(p1);
        break; 
      }

      this.createMatch(p1, p2);
      console.log(`Partida creada. Jugadores restantes en cola: ${this.queue.length}`);
    }
  }

  // Crear una nueva partida
  createMatch(p1, p2) {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const match = {
      id: matchId,
      p1: {
        ...p1,
        health: 30,
        mana: 6,
        maxMana: 6,
        cardsPlayed: 0,
        hand: this.generateHand(),
        field: [null, null, null],
        deck: this.generateDeck(),
        hasPlayed: false
      },
      p2: {
        ...p2,
        health: 30,
        mana: 6,
        maxMana: 6,
        cardsPlayed: 0,
        hand: this.generateHand(),
        field: [null, null, null],
        deck: this.generateDeck(),
        hasPlayed: false
      },
      round: 1,
      maxRounds: 3,
      status: 'playing',
      turnTime: 45, // segundos
      startedAt: Date.now(),
      moves: [] // Historial de movimientos
    };

    this.activeMatches.set(matchId, match);

    console.log(`⚔️ MATCH CREADO: ${p1.username} (${p1.elo}) vs ${p2.username} (${p2.elo})`);
    console.log(`📍 Match ID: ${matchId}`);

    return match;
  }

  // Generar mano inicial (5 cartas aleatorias)
  generateHand() {
    const cardIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const hand = [];
    for (let i = 0; i < 5; i++) {
      const randomId = cardIds[Math.floor(Math.random() * cardIds.length)];
      hand.push(randomId);
    }
    return hand;
  }

  // Generar mazo (30 cartas)
  generateDeck() {
    const cardIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const deck = [];
    for (let i = 0; i < 30; i++) {
      const randomId = cardIds[Math.floor(Math.random() * cardIds.length)];
      deck.push(randomId);
    }
    return deck;
  }

  // Obtener match por ID
  getMatch(matchId) {
    return this.activeMatches.get(matchId);
  }

  // Remover jugador de la cola
  removeFromQueue(socketId) {
    this.queue = this.queue.filter(p => p.socketId !== socketId);
  }

  // Finalizar partida
  endMatch(matchId, winnerId, p1Health, p2Health) {
    const match = this.activeMatches.get(matchId);
    if (!match) return;

    match.status = 'finished';
    match.endedAt = Date.now();
    match.winnerId = winnerId;
    match.p1HealthRemaining = p1Health;
    match.p2HealthRemaining = p2Health;

    console.log(`🏆 MATCH FINALIZADO: ${match.id} | Ganador: ${winnerId}`);

    return match;
  }

  // Obtener stats de jugador
  getPlayerStats(userId) {
    const matches = Array.from(this.activeMatches.values()).filter(
      m => m.p1.userId === userId || m.p2.userId === userId
    );

    const wins = matches.filter(m => m.winnerId === userId).length;
    const losses = matches.filter(m => m.winnerId && m.winnerId !== userId).length;

    return {
      totalMatches: matches.length,
      wins,
      losses,
      winrate: matches.length > 0 ? ((wins / matches.length) * 100).toFixed(2) : 0
    };
  }

  // Limpiar colas (mantenimiento)
  cleanup() {
    const now = Date.now();
    // Remover jugadores que esperan más de 5 minutos
    this.queue = this.queue.filter(p => now - p.joinedAt < 300000);

    // Remover matches terminadas hace más de 10 minutos
    for (const [matchId, match] of this.activeMatches) {
      if (match.status === 'finished' && now - match.endedAt > 600000) {
        this.activeMatches.delete(matchId);
      }
    }
  }
}

module.exports = MatchmakingQueue;
